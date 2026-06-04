namespace TaskManagement.Api.Models;

public record RegisterRequest(string Email, string Password, string? DisplayName);

public record LoginRequest(string Email, string Password);

public record AuthResponse(string Token, string Email, string Role);

public record TaskItemDto(
    int? Id,
    string Title,
    string? Description,
    DateTime? DueDate,
    bool IsComplete,
    string Priority,
    string? Category,
    string OwnerId,
    string? OwnerEmail);
