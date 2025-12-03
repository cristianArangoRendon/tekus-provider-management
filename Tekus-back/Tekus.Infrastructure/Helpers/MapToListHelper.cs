using System.Collections.Concurrent;
using System.Data;
using System.Linq.Expressions;
using System.Reflection;

namespace Tekus.Infrastructure.Helpers
{

    public static class MapToListHelper
    {
        private static readonly ConcurrentDictionary<Type, Func<IDataReader, object>> _mapperCache = new();

        private static readonly ConcurrentDictionary<Type, PropertyInfo[]> _propertyCache = new();

        public static List<T> MapToList<T>(IDataReader dataReader) where T : new()
        {
            ArgumentNullException.ThrowIfNull(dataReader);

            var properties = _propertyCache.GetOrAdd(typeof(T), type =>
                type.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                    .Where(p => p.CanWrite)
                    .ToArray()
            );

            var columnMapping = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            for (int i = 0; i < dataReader.FieldCount; i++)
            {
                columnMapping[dataReader.GetName(i)] = i;
            }

            var propertySetters = BuildPropertySetters<T>(properties, columnMapping);

            var list = new List<T>(capacity: 100);

            while (dataReader.Read())
            {
                var obj = new T();

                foreach (var setter in propertySetters)
                {
                    setter(obj, dataReader);
                }

                list.Add(obj);
            }

            return list;
        }

        public static List<T> MapToListWithCapacity<T>(IDataReader dataReader, int expectedRows) where T : new()
        {
            ArgumentNullException.ThrowIfNull(dataReader);

            var properties = _propertyCache.GetOrAdd(typeof(T), type =>
                type.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                    .Where(p => p.CanWrite)
                    .ToArray()
            );

            var columnMapping = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            for (int i = 0; i < dataReader.FieldCount; i++)
            {
                columnMapping[dataReader.GetName(i)] = i;
            }

            var propertySetters = BuildPropertySetters<T>(properties, columnMapping);
            var list = new List<T>(capacity: expectedRows);

            while (dataReader.Read())
            {
                var obj = new T();
                foreach (var setter in propertySetters)
                {
                    setter(obj, dataReader);
                }
                list.Add(obj);
            }

            return list;
        }


        private static List<Action<T, IDataReader>> BuildPropertySetters<T>(
            PropertyInfo[] properties,
            Dictionary<string, int> columnMapping)
        {
            var setters = new List<Action<T, IDataReader>>();

            foreach (var property in properties)
            {
                if (!columnMapping.TryGetValue(property.Name, out int columnIndex))
                    continue;

                var setter = CreateFastSetter<T>(property, columnIndex);
                if (setter != null)
                {
                    setters.Add(setter);
                }
            }

            return setters;
        }

        private static Action<T, IDataReader>? CreateFastSetter<T>(PropertyInfo property, int columnIndex)
        {
            try
            {
                var targetType = Nullable.GetUnderlyingType(property.PropertyType) ?? property.PropertyType;

                var objParam = Expression.Parameter(typeof(T), "obj");
                var readerParam = Expression.Parameter(typeof(IDataReader), "reader");

                var getValueCall = Expression.Call(
                    readerParam,
                    typeof(IDataReader).GetMethod("GetValue")!,
                    Expression.Constant(columnIndex)
                );

                var isDbNullCall = Expression.Call(
                    readerParam,
                    typeof(IDataReader).GetMethod("IsDBNull")!,
                    Expression.Constant(columnIndex)
                );

                Expression setValue;

                if (targetType == typeof(string))
                {
                    setValue = Expression.Condition(
                        isDbNullCall,
                        Expression.Constant(null, typeof(string)),
                        Expression.Convert(getValueCall, typeof(string))
                    );
                }
                else if (targetType.IsValueType)
                {
                    var defaultValue = Expression.Default(property.PropertyType);

                    setValue = Expression.Condition(
                        isDbNullCall,
                        defaultValue,
                        Expression.Convert(
                            Expression.Call(
                                typeof(Convert).GetMethod($"To{targetType.Name}", new[] { typeof(object) })!,
                                getValueCall
                            ),
                            property.PropertyType
                        )
                    );
                }
                else
                {
                    setValue = Expression.Condition(
                        isDbNullCall,
                        Expression.Constant(null, property.PropertyType),
                        Expression.Convert(getValueCall, property.PropertyType)
                    );
                }

                var propertyAccess = Expression.Property(objParam, property);
                var assign = Expression.Assign(propertyAccess, setValue);

                var lambda = Expression.Lambda<Action<T, IDataReader>>(assign, objParam, readerParam);
                return lambda.Compile();
            }
            catch
            {
                return (obj, reader) =>
                {
                    if (!reader.IsDBNull(columnIndex))
                    {
                        var value = reader.GetValue(columnIndex);
                        var targetType = Nullable.GetUnderlyingType(property.PropertyType) ?? property.PropertyType;
                        var convertedValue = Convert.ChangeType(value, targetType);
                        property.SetValue(obj, convertedValue);
                    }
                };
            }
        }

        public static void ClearCache()
        {
            _mapperCache.Clear();
            _propertyCache.Clear();
        }
    }
}
