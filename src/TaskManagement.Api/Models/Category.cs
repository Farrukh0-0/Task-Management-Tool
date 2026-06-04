using System.ComponentModel.DataAnnotations;

namespace TaskManagement.Api.Models;

public class Category
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
