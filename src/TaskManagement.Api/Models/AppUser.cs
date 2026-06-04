using Microsoft.AspNetCore.Identity;

namespace TaskManagement.Api.Models;

public class AppUser : IdentityUser
{
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
