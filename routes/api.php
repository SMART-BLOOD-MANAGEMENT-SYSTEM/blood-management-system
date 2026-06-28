<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BloodBankController;
use App\Http\Controllers\BloodRequestController;
use App\Http\Controllers\DonorController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\SlotController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/donors', [DonorController::class, 'index']);
Route::get('/blood-requests', [BloodRequestController::class, 'index']);
Route::get('/blood-banks', [BloodBankController::class, 'index']);
Route::get('/inventory', [BloodBankController::class, 'inventory']);
Route::get('/appointments', [AppointmentController::class, 'index']);
Route::get('/slots', [SlotController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/donor-requests', [BloodRequestController::class, 'store']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/my-appointments', [AppointmentController::class, 'myAppointments']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/blood-banks', [BloodBankController::class, 'store']);
    Route::put('/blood-banks/{id}', [BloodBankController::class, 'update']);
    Route::post('/blood-requests', [BloodRequestController::class, 'store']);
    Route::put('/blood-requests/{id}', [BloodRequestController::class, 'update']);
    Route::delete('/blood-requests/{id}', [BloodRequestController::class, 'destroy']);
    Route::post('/blood-requests/{id}/fulfill', [BloodRequestController::class, 'fulfill']);
    Route::post('/inventory', [BloodBankController::class, 'addStock']);
    Route::put('/appointments/{id}', [AppointmentController::class, 'updateStatus']);
    Route::post('/slots', [SlotController::class, 'store']);
    Route::get('/admin/appointments', [DonorController::class, 'appointments']);
    Route::get('/admin/inventory', [BloodBankController::class, 'inventory']);
    Route::get('/admin/requests', [BloodRequestController::class, 'adminIndex']);
    Route::get('/admin/blood-banks', [BloodBankController::class, 'indexAll']);
});
