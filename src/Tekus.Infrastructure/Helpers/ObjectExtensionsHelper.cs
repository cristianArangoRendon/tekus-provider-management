namespace Tekus.infraestructure.Helpers
{
    public static class ObjectExtensionsHelper
    {
        public static T ToObject<T>(this object dto) where T : new()
        {
            var entity = new T();
            var dtoProperties = dto.GetType().GetProperties();
            var entityProperties = entity.GetType().GetProperties();

            foreach (var entityProperty in entityProperties)
            {
                var matchingDtoProperty = dtoProperties.FirstOrDefault(p => p.Name == entityProperty.Name);

                if (matchingDtoProperty != null)
                {
                    var dtoValue = matchingDtoProperty.GetValue(dto);
                    entityProperty.SetValue(entity, dtoValue);
                }
            }

            return entity;
        }
    }
}
