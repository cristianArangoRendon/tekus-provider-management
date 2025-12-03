using System.Collections.Concurrent;
using System.Data;
using System.Reflection;

namespace Tekus.infraestructure.Helpers
{
    public static class MapToObjHelper
    {
        private static readonly ConcurrentDictionary<Type, PropertyInfo[]> _propertyCache = new();

        private static readonly ConcurrentDictionary<string, Dictionary<string, int>> _columnCache = new();
        public static T? MapToObj<T>(IDataReader dataReader) where T : new()
        {
            ArgumentNullException.ThrowIfNull(dataReader);

            if (!dataReader.Read())
            {
                return default;
            }

            var properties = _propertyCache.GetOrAdd(typeof(T), type =>
                type.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                    .Where(p => p.CanWrite)
                    .ToArray()
            );

            var columnMapping = BuildColumnMapping(dataReader);

            var obj = new T();

            foreach (var property in properties)
            {
                if (!columnMapping.TryGetValue(property.Name, out int columnIndex))
                    continue;

                if (dataReader.IsDBNull(columnIndex))
                    continue;

                try
                {
                    var value = dataReader.GetValue(columnIndex);
                    var targetType = Nullable.GetUnderlyingType(property.PropertyType) ?? property.PropertyType;

                    if (targetType == typeof(string))
                    {
                        property.SetValue(obj, value?.ToString());
                    }
                    else if (targetType == typeof(int))
                    {
                        property.SetValue(obj, Convert.ToInt32(value));
                    }
                    else if (targetType == typeof(long))
                    {
                        property.SetValue(obj, Convert.ToInt64(value));
                    }
                    else if (targetType == typeof(decimal))
                    {
                        property.SetValue(obj, Convert.ToDecimal(value));
                    }
                    else if (targetType == typeof(bool))
                    {
                        property.SetValue(obj, Convert.ToBoolean(value));
                    }
                    else if (targetType == typeof(DateTime))
                    {
                        property.SetValue(obj, Convert.ToDateTime(value));
                    }
                    else if (targetType == typeof(double))
                    {
                        property.SetValue(obj, Convert.ToDouble(value));
                    }
                    else if (targetType == typeof(float))
                    {
                        property.SetValue(obj, Convert.ToSingle(value));
                    }
                    else if (targetType == typeof(Guid))
                    {
                        property.SetValue(obj, value is Guid guid ? guid : Guid.Parse(value.ToString()!));
                    }
                    else
                    {
                        var convertedValue = Convert.ChangeType(value, targetType);
                        property.SetValue(obj, convertedValue);
                    }
                }
                catch
                {
                    continue;
                }
            }

            return obj;
        }


        public static List<T> MapToList<T>(IDataReader dataReader) where T : new()
        {
            ArgumentNullException.ThrowIfNull(dataReader);

            var properties = _propertyCache.GetOrAdd(typeof(T), type =>
                type.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                    .Where(p => p.CanWrite)
                    .ToArray()
            );

            var columnMapping = BuildColumnMapping(dataReader);
            var list = new List<T>(capacity: 100);

            var setters = new List<Action<T, IDataReader>>();
            foreach (var property in properties)
            {
                if (columnMapping.TryGetValue(property.Name, out int columnIndex))
                {
                    var setter = CreateSetter<T>(property, columnIndex);
                    setters.Add(setter);
                }
            }

            while (dataReader.Read())
            {
                var obj = new T();
                foreach (var setter in setters)
                {
                    setter(obj, dataReader);
                }
                list.Add(obj);
            }

            return list;
        }


        private static Dictionary<string, int> BuildColumnMapping(IDataReader dataReader)
        {
            var mapping = new Dictionary<string, int>(
                capacity: dataReader.FieldCount,
                comparer: StringComparer.OrdinalIgnoreCase
            );

            for (int i = 0; i < dataReader.FieldCount; i++)
            {
                mapping[dataReader.GetName(i)] = i;
            }

            return mapping;
        }

        private static Action<T, IDataReader> CreateSetter<T>(PropertyInfo property, int columnIndex)
        {
            var targetType = Nullable.GetUnderlyingType(property.PropertyType) ?? property.PropertyType;

            return (obj, reader) =>
            {
                if (reader.IsDBNull(columnIndex))
                    return;

                try
                {
                    var value = reader.GetValue(columnIndex);

                    object? convertedValue = targetType.Name switch
                    {
                        nameof(String) => value?.ToString(),
                        nameof(Int32) => Convert.ToInt32(value),
                        nameof(Int64) => Convert.ToInt64(value),
                        nameof(Decimal) => Convert.ToDecimal(value),
                        nameof(Boolean) => Convert.ToBoolean(value),
                        nameof(DateTime) => Convert.ToDateTime(value),
                        nameof(Double) => Convert.ToDouble(value),
                        nameof(Single) => Convert.ToSingle(value),
                        nameof(Guid) => value is Guid guid ? guid : Guid.Parse(value.ToString()!),
                        _ => Convert.ChangeType(value, targetType)
                    };

                    property.SetValue(obj, convertedValue);
                }
                catch
                {
                }
            };
        }

        public static bool FieldExists(this IDataReader reader, string fieldName)
        {
            ArgumentNullException.ThrowIfNull(reader);
            ArgumentException.ThrowIfNullOrWhiteSpace(fieldName);

            try
            {
                _ = reader.GetOrdinal(fieldName);
                return true;
            }
            catch (IndexOutOfRangeException)
            {
                return false;
            }
        }


        public static int GetOrdinalOrDefault(this IDataReader reader, string fieldName)
        {
            try
            {
                return reader.GetOrdinal(fieldName);
            }
            catch (IndexOutOfRangeException)
            {
                return -1;
            }
        }

        public static T? GetValueOrDefault<T>(this IDataReader reader, string fieldName)
        {
            var ordinal = reader.GetOrdinalOrDefault(fieldName);
            if (ordinal == -1 || reader.IsDBNull(ordinal))
            {
                return default;
            }

            try
            {
                var value = reader.GetValue(ordinal);
                var targetType = Nullable.GetUnderlyingType(typeof(T)) ?? typeof(T);
                return (T?)Convert.ChangeType(value, targetType);
            }
            catch
            {
                return default;
            }
        }


        public static void ClearCache()
        {
            _propertyCache.Clear();
            _columnCache.Clear();
        }
    }
}