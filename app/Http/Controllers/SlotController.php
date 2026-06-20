<?php

namespace App\Http\Controllers;

use App\Models\DonationSlot;
use Illuminate\Http\Request;

class SlotController extends Controller
{
    public function index()
    {
        $slots = DonationSlot::orderBy('slot_date', 'desc')->get();
        return response()->json($slots);
    }

    public function store(Request $request)
    {
        $request->headers->set('Accept', 'application/json');

        $request->validate([
            'bank_id' => 'required|exists:blood_banks,id',
            'slot_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'max_capacity' => 'required|integer|min:1',
        ]);

        $slot = DonationSlot::create([
            'bank_id' => $request->bank_id,
            'slot_date' => $request->slot_date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'max_capacity' => $request->max_capacity,
        ]);

        return response()->json($slot, 201);
    }
}
