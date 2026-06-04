using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagement.Api.Data;
using TaskManagement.Api.Models;

namespace TaskManagement.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly ApplicationDbContext _dbContext;

    public UsersController(UserManager<AppUser> userManager, ApplicationDbContext dbContext)
    {
        _userManager = userManager;
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _userManager.Users
            .Select(u => new { u.Id, u.Email })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("progress")]
    public async Task<IActionResult> GetUserProgress()
    {
        var progress = await _dbContext.Users
            .Select(u => new
            {
                u.Id,
                u.Email,
                TotalTasks = _dbContext.Tasks.Count(t => t.OwnerId == u.Id),
                CompletedTasks = _dbContext.Tasks.Count(t => t.OwnerId == u.Id && t.IsComplete),
                OpenTasks = _dbContext.Tasks.Count(t => t.OwnerId == u.Id && !t.IsComplete)
            })
            .ToListAsync();

        return Ok(progress);
    }

    [HttpGet("{id}/tasks")]
    public async Task<IActionResult> GetUserTasks(string id)
    {
        var tasks = await _dbContext.Tasks
            .Include(t => t.Owner)
            .Include(t => t.Category)
            .Where(t => t.OwnerId == id)
            .Select(t => new TaskItemDto(
                t.Id,
                t.Title,
                t.Description,
                t.DueDate,
                t.IsComplete,
                t.Priority,
                t.Category != null ? t.Category.Name : null,
                t.OwnerId,
                t.Owner!.Email))
            .ToListAsync();

        return Ok(tasks);
    }
}
