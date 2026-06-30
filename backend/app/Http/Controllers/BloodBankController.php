<?php

namespace App\Http\Controllers;

use App\Models\BloodInventory;
use App\Models\BloodBank;
use Illuminate\Http\Request;

class BloodBankController extends Controller
{
    public function index()
    {
        $banks = BloodBank::where('operational_status', 'active')->get();
        return response()->json($banks);
    }

    public function indexAll(Request $request)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin access only.'], 403);
        }

        $banks = BloodBank::all();
        return response()->json($banks);
    }

    public function store(Request $request)
    {
        $request->headers->set('Accept', 'application/json');

        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin access only.'], 403);
        }

        $request->validate([
            'name' => 'required|string',
            'city' => 'nullable|string',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'facility_type' => 'nullable|string',
            'working_hours' => 'nullable|string',
            'operational_status' => 'nullable|string',
        ]);

        $bank = BloodBank::create([
            'name' => $request->name,
            'city' => $request->city,
            'phone' => $request->phone,
            'address' => $request->address,
            'facility_type' => $request->facility_type,
            'working_hours' => $request->working_hours,
            'operational_status' => $request->operational_status ?? 'active',
        ]);

        return response()->json($bank, 201);
    }

    public function update(Request $request, $id)
    {
        $request->headers->set('Accept', 'application/json');

        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin access only.'], 403);
        }

        $bank = BloodBank::findOrFail($id);
        $bank->update($request->only([
            'name', 'city', 'phone', 'address',
            'facility_type', 'working_hours', 'operational_status'
        ]));
        return response()->json($bank);
    }

    public function inventory()
    {
        $inventory = BloodInventory::orderBy('created_at', 'desc')->get();
        return response()->json($inventory);
    }

    public function addStock(Request $request)
    {
        $request->headers->set('Accept', 'application/json');

        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin access only.'], 403);
        }

        $request->validate([
            'blood_type' => 'required|string',
            'units' => 'required|integer|min:1',
            'expiration_date' => 'nullable|date',
        ]);

        $item = BloodInventory::create([
            'blood_bank_id' => 1,
            'blood_type' => $request->blood_type,
            'units' => $request->units,
            'expiration_date' => $request->expiration_date,
        ]);

        return response()->json($item, 201);
    }
}
