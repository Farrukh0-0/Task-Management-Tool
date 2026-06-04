using System.ComponentModel.DataAnnotations;

namespace TaskManagement.Api.Models;

public class TaskItem
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool IsComplete { get; set; }

    public DateTime? DueDate { get; set; }

    [Required]
    public string Priority { get; set; } = "Medium";

    public string? Category { get; set; }

    [Required]
    public string OwnerId { get; set; } = string.Empty;

    public AppUser? Owner { get; set; }
}
