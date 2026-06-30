<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // تسجيل الدخول
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password_hash)) {
            return response()->json(['message' => 'Invalid email or password'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => $user,
            'role' => $user->role,
        ], 200);
    }

    // التسجيل
    public function register(Request $request)
    {
        $request->headers->set('Accept', 'application/json');
        $request->validate([
            'full_name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'required|string|unique:users,phone',
            'city' => 'nullable|string',
            'blood_type' => 'nullable|string',
            'gender' => 'nullable|string',
            'birth_date' => 'nullable|date',
        ]);

        $user = User::create([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'password_hash' => Hash::make($request->password),
            'phone' => $request->phone,
            'city' => $request->city,
            'blood_type' => $request->blood_type,
            'gender' => $request->gender,
            'birth_date' => $request->birth_date,
            'role' => 'donor',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'تم إنشاء الحساب بنجاح',
            'token' => $token,
            'user' => $user,
        ], 201);
    }

    // جلب بيانات الملف الشخصي
    public function profile(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
{
    $request->headers->set('Accept', 'application/json');

    $user = $request->user();

    $request->validate([
        'full_name' => 'sometimes|string|max:100',
        'blood_type' => 'nullable|string',
        'phone' => 'nullable|string|unique:users,phone,' . $user->id,
        'city' => 'nullable|string',
        'gender' => 'nullable|string',
        'birth_date' => 'nullable|date',
    ]);

    $user->update($request->only([
        'full_name', 'blood_type', 'phone', 'city', 'gender', 'birth_date'
    ]));

    return response()->json([
        'message' => 'تم تحديث الملف الشخصي بنجاح',
        'user' => $user
    ]);
}
    // تسجيل الخروج
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'تم تسجيل الخروج بنجاح']);
    }
}
