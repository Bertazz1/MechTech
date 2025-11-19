package com.mechtech.MyMechanic.web.controller;


import com.mechtech.MyMechanic.config.security.IsAdmin;
import com.mechtech.MyMechanic.config.security.IsAdminOrOwner;
import com.mechtech.MyMechanic.entity.User;
import com.mechtech.MyMechanic.service.UserService;
import com.mechtech.MyMechanic.web.dto.user.*;
import com.mechtech.MyMechanic.web.mapper.UserMapper;
import com.mechtech.MyMechanic.web.dto.pageable.PageableDto;
import com.mechtech.MyMechanic.web.mapper.PageableMapper;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.mechtech.MyMechanic.jwt.JwtUserDetails;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;
    private final PageableMapper pageableMapper;


    @PostMapping
    public ResponseEntity<UserResponseDto> createUser(@Valid @RequestBody UserCreateDto userCreateDto) {
        User savedUser = userService.createUser(userMapper.toUser(userCreateDto));
        return ResponseEntity.status(HttpStatus.CREATED).body(userMapper.toDto(savedUser));
    }

    @IsAdminOrOwner(id = "id")
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getById(@Valid @PathVariable Long id) {
        User savedUser = userService.findById(id);
        return ResponseEntity.ok(userMapper.toDto(savedUser));
    }

    @IsAdmin
    @GetMapping
    public ResponseEntity<PageableDto> getAllUsers(@PageableDefault(size = 5, sort = "username") Pageable pageable) {
            Page<User> userPage = userService.findAll(pageable);
            Page<UserResponseDto> userResponseDTOPageable = userPage.map(userMapper::toDto);
            return ResponseEntity.ok(pageableMapper.toDto(userResponseDTOPageable));
        }

    @IsAdminOrOwner(id = "id")
    @PatchMapping("/{id}")
    public ResponseEntity<Void> updatePassword(@Valid @PathVariable Long id,@RequestBody UserPasswordDto dto) {
        User savedUser = userService.updatePassword(id, dto.getOldPassword(), dto.getNewPassword(), dto.getConfirmNewPassword());
        return ResponseEntity.noContent().build();
    }

    @IsAdminOrOwner(id = "id")
    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getCurrentUser(@AuthenticationPrincipal JwtUserDetails userDetails) {
        User currentUser = userService.findById(userDetails.getId());
        return ResponseEntity.ok(userMapper.toDto(currentUser));
    }

    @IsAdminOrOwner(id = "id")
    @PutMapping("/me")
    public ResponseEntity<UserResponseDto> updateProfile(@Valid @RequestBody UserUpdateDto userUpdateDto,
                                                        @AuthenticationPrincipal JwtUserDetails userDetails) {
        User updatedUser = userService.updateProfile(userDetails.getId(), userUpdateDto);
        return ResponseEntity.ok(userMapper.toDto(updatedUser));
    }

    @IsAdmin
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        User user = userService.findById(id);
        userService.delete(user);
        return ResponseEntity.noContent().build();
    }

    @IsAdmin
    @GetMapping("/search")
    public ResponseEntity<PageableDto> search(@RequestParam(name = "q", required = false) String query, Pageable pageable) {
        Page<User> userPage = userService.search(query, pageable);
        Page<UserResponseDto> dtoPage = userPage.map(userMapper::toDto);
        return ResponseEntity.ok(pageableMapper.toDto(dtoPage));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody UserForgotPasswordDto dto) {
        User user = userService.createPasswordResetToken(dto.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody UserResetPasswordDto dto) {
        userService.resetPassword(dto.getToken(), dto.getNewPassword(), dto.getConfirmNewPassword());
        return ResponseEntity.noContent().build();
    }



}
