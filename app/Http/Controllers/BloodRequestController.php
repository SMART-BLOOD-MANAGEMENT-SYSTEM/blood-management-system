<?php

namespace App\Http\Controllers;

use App\Models\BloodRequest;
use App\Models\BloodInventory;
use Illuminate\Http\Request;

class BloodRequestController extends Controller
{
    public function index()
    {
        $requests = BloodRequest::orderBy('created_at', 'desc')->get();
        return response()->json($requests);
    }

    public function store(Request $request)
    {
        $request->headers->set('Accept', 'application/json');

        $request->validate([
            'bank_id' => 'required|exists:blood_banks,id',
            'blood_type' => 'required|string',
            'units_needed' => 'required|integer|min:1',
            'urgency_level' => 'nullable|string',
            'patient_name' => 'nullable|string',
        ]);

        $bloodRequest = BloodRequest::create([
            'bank_id' => $request->bank_id,
            'user_id' => 1,
            'blood_type' => $request->blood_type,
            'units_needed' => $request->units_needed,
            'urgency_level' => $request->urgency_level ?? 'normal',
            'patient_name' => $request->patient_name,
            'status' => 'pending',
        ]);

        return response()->json($bloodRequest, 201);
    }

    public function update(Request $request, $id)
    {
        $request->headers->set('Accept', 'application/json');

        $bloodRequest = BloodRequest::findOrFail($id);
        $bloodRequest->update($request->only([
            'blood_type',
            'units_needed',
            'urgency_level',
            'patient_name',
        ]));

        return response()->json($bloodRequest);
    }

    public function fulfill(Request $request, $id)
    {
        $request->headers->set('Accept', 'application/json');

        $request->validate([
            'units_given' => 'required|integer|min:1',
        ]);

        $bloodRequest = BloodRequest::findOrFail($id);

        // تحقق إذا الوحدات المعطاة أكثر من المطلوبة
        if ($request->units_given > $bloodRequest->units_needed) {
            return response()->json([
                'message' => 'Cannot give more than needed. Units needed: ' . $bloodRequest->units_needed
            ], 422);
        }

        // تحقق إذا في مخزون كافي
        $inventory = BloodInventory::where('blood_type', $bloodRequest->blood_type)
            ->where('blood_bank_id', $bloodRequest->bank_id)
            ->orderBy('expiration_date', 'asc')
            ->get();

        $totalAvailable = $inventory->sum('units');

        if ($totalAvailable < $request->units_given) {
            return response()->json([
                'message' => 'Not enough stock available. Available: ' . $totalAvailable . ' units.'
            ], 422);
        }

        // ننقص من المخزون
        $unitsToDeduct = $request->units_given;
        foreach ($inventory as $item) {
            if ($unitsToDeduct <= 0) break;

            if ($item->units <= $unitsToDeduct) {
                $unitsToDeduct -= $item->units;
                $item->delete();
            } else {
                $item->units -= $unitsToDeduct;
                $item->save();
                $unitsToDeduct = 0;
            }
        }

        // ننقص من الطلب
        $bloodRequest->units_needed -= $request->units_given;

        // لو الطلب اكتمل
        if ($bloodRequest->units_needed <= 0) {
            $bloodRequest->units_needed = 0;
            $bloodRequest->status = 'fulfilled';
        }

        $bloodRequest->save();

        return response()->json($bloodRequest);
    }

    public function destroy($id)
    {
        $bloodRequest = BloodRequest::findOrFail($id);
        $bloodRequest->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    public function adminIndex()
    {
        $requests = BloodRequest::orderBy('created_at', 'desc')->get();
        return response()->json($requests);
    }
}
