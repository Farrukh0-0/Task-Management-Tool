using System.ComponentModel.DataAnnotations;

namespace TaskManagement.Api.Models;

public class TaskComment
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int TaskId { get; set; }
    public TaskItem? Task { get; set; }

    [Required]
    public string AuthorId { get; set; } = string.Empty;
    public AppUser? Author { get; set; }

    [Required]
    public string Body { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
