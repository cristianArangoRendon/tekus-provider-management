using Konscious.Security.Cryptography;
using System.Security.Cryptography;
using System.Text;
using Tekus.Core.Interfaces.Services;

namespace Tekus.Infrastructure.Services
{
    public class Argon2SecurityService : ISecurityService
    {
        private const int SaltSize = 16;           // 128 bits
        private const int HashSize = 32;           // 256 bits
        private const int DegreeOfParallelism = 8; // # de hilos
        private const int MemorySize = 65536;      // En KB (64 MB)
        private const int Iterations = 4;          // Iteraciones (Time cost)


        public (string hash, string salt) HashPassword(string password)
        {
            if (string.IsNullOrWhiteSpace(password))
                throw new ArgumentException("La contraseña no puede estar vacía.", nameof(password));

            byte[] saltBytes = GetSecureSalt(SaltSize);

            using var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password));
            argon2.Salt = saltBytes;
            argon2.DegreeOfParallelism = DegreeOfParallelism;
            argon2.MemorySize = MemorySize;
            argon2.Iterations = Iterations;

            byte[] hashBytes = argon2.GetBytes(HashSize);

            string hashBase64 = Convert.ToBase64String(hashBytes);
            string saltBase64 = Convert.ToBase64String(saltBytes);

            return (hashBase64, saltBase64);
        }


        public bool VerifyPassword(string inputPassword, string storedHash, string storedSalt)
        {
            if (string.IsNullOrWhiteSpace(inputPassword) ||
                string.IsNullOrWhiteSpace(storedHash) ||
                string.IsNullOrWhiteSpace(storedSalt))
            {
                return false;
            }

            byte[] saltBytes;
            byte[] storedHashBytes;
            try
            {
                saltBytes = Convert.FromBase64String(storedSalt);
                storedHashBytes = Convert.FromBase64String(storedHash);
            }
            catch
            {
                return false;
            }

            using var argon2 = new Argon2id(Encoding.UTF8.GetBytes(inputPassword));
            argon2.Salt = saltBytes;
            argon2.DegreeOfParallelism = DegreeOfParallelism;
            argon2.MemorySize = MemorySize;
            argon2.Iterations = Iterations;

            byte[] newHashBytes = argon2.GetBytes(HashSize);

            return AreHashesEqual(storedHashBytes, newHashBytes);
        }


        private static byte[] GetSecureSalt(int size)
        {
            var salt = new byte[size];
            RandomNumberGenerator.Fill(salt);
            return salt;
        }


        private static bool AreHashesEqual(byte[] hashA, byte[] hashB)
        {
            if (hashA.Length != hashB.Length)
                return false;

            int diff = 0;
            for (int i = 0; i < hashA.Length; i++)
            {
                diff |= hashA[i] ^ hashB[i];
            }
            return diff == 0;
        }
    }
}
