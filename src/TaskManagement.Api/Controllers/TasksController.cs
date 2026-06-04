using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagement.Api.Data;
using TaskManagement.Api.Models;

namespace TaskManagement.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;

    public TasksController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetTasks()
    {
        var isAdmin = User.IsInRole("Admin");
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var query = _dbContext.Tasks.Include(t => t.Owner).AsQueryable();
        if (!isAdmin)
        {
            query = query.Where(t => t.OwnerId == currentUserId);
        }

        var tasks = await query.Select(t => new TaskItemDto(
            t.Id,
            t.Title,
            t.Description,
            t.DueDate,
            t.IsComplete,
            t.Priority,
            t.Category,
            t.OwnerId,
            t.Owner!.Email)).ToListAsync();

        return Ok(tasks);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetTask(int id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var task = await _dbContext.Tasks.Include(t => t.Owner).FirstOrDefaultAsync(t => t.Id == id);
        if (task is null)
        {
            return NotFound();
        }

        if (!User.IsInRole("Admin") && task.OwnerId != currentUserId)
        {
            return Forbid();
        }

        return Ok(new TaskItemDto(
            task.Id,
            task.Title,
            task.Description,
            task.DueDate,
            task.IsComplete,
            task.Priority,
            task.Category,
            task.OwnerId,
            task.Owner?.Email));
    }

    [HttpPost]
    public async Task<IActionResult> CreateTask(TaskItemDto request)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        var isAdmin = User.IsInRole("Admin");
        var ownerId = isAdmin && !string.IsNullOrEmpty(request.OwnerId) ? request.OwnerId : currentUserId;

        var task = new TaskItem
        {
            Title = request.Title,
            Description = request.Description,
            DueDate = request.DueDate,
            IsComplete = request.IsComplete,
            Priority = request.Priority,
            Category = request.Category,
            OwnerId = ownerId
        };

        _dbContext.Tasks.Add(task);
        await _dbContext.SaveChangesAsync();

        await _dbContext.Entry(task).Reference(t => t.Owner).LoadAsync();

        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, new TaskItemDto(
            task.Id,
            task.Title,
            task.Description,
            task.DueDate,
            task.IsComplete,
            task.Priority,
            task.Category,
            task.OwnerId,
            task.Owner?.Email));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateTask(int id, TaskItemDto request)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");
        var task = await _dbContext.Tasks.FindAsync(id);
        if (task is null)
        {
            return NotFound();
        }

        if (!isAdmin && task.OwnerId != currentUserId)
        {
            return Forbid();
        }

        task.Title = request.Title;
        task.Description = request.Description;
        task.DueDate = request.DueDate;
        task.IsComplete = request.IsComplete;
        task.Priority = request.Priority;
        task.Category = request.Category;

        if (isAdmin && !string.IsNullOrEmpty(request.OwnerId))
        {
            task.OwnerId = request.OwnerId;
        }

        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var task = await _dbContext.Tasks.FindAsync(id);
        if (task is null)
        {
            return NotFound();
        }

        if (!User.IsInRole("Admin") && task.OwnerId != currentUserId)
        {
            return Forbid();
        }

        _dbContext.Tasks.Remove(task);
        await _dbContext.SaveChangesAsync();
        return NoContent();
    }
}
