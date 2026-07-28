using WiMakit.API.Models;

namespace WiMakit.API.Extensions
{
    public static class UserNameExtensions
    {
        public static string GetFullName(this User? user)
        {
            if (user == null) return string.Empty;
            return $"{user.FirstName} {user.LastName}".Trim();
        }
    }
}
