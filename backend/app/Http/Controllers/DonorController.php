<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class DonorController extends Controller
{
    public function index()
    {
        $donors = User::where('role', 'donor')->get();
        return response()->json($donors);
    }

    public function appointments()
    {
        $appointments = \App\Models\Appointment::with('user')->orderBy('created_at', 'desc')->get();
        return response()->json($appointments);
    }
}
