<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Notification;
use App\Models\User;
use App\Models\BloodInventory;
use App\Models\DonationSlot;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index()
    {
        $appointments = Appointment::with('user')->orderBy('created_at', 'desc')->get();
        return response()->json($appointments);
    }

    public function store(Request $request)
    {
        $request->headers->set('Accept', 'application/json');

        $request->validate([
            'slot_id' => 'required|exists:donation_slots,id',
        ]);

        $user = $request->user();
        $userId = $user ? $user->id : 1;
        $donorName = $user ? $user->full_name : 'A donor';

        // تحقق إذا الدونر عنده موعد pending أو accepted
        $existingAppointment = Appointment::where('user_id', $userId)
            ->whereIn('status', ['pending', 'accepted'])
            ->first();

        if ($existingAppointment) {
            return response()->json([
                'message' => 'You already have an active appointment. Please wait until it is completed or cancelled.'
            ], 422);
        }

        // تحقق من المدة الطبية (56 يوم من آخر تبرع)
        $lastDonation = Appointment::where('user_id', $userId)
            ->where('status', 'completed')
            ->orderBy('updated_at', 'desc')
            ->first();

        if ($lastDonation) {
            $daysSinceLastDonation = now()->diffInDays($lastDonation->updated_at);
            if ($daysSinceLastDonation < 56) {
               $daysLeft = 56 - (int) $daysSinceLastDonation;
return response()->json([
    'message' => 'You cannot donate yet. Please wait ' . $daysLeft . ' more days before your next donation.'
], 422);
            }
        }

        // تحقق من السعة
        $slot = DonationSlot::findOrFail($request->slot_id);

        if ($slot->current_capacity >= $slot->max_capacity) {
            return response()->json(['message' => 'This slot is fully booked!'], 422);
        }

        $slot->increment('current_capacity');

        $appointment = Appointment::create([
            'user_id' => $userId,
            'blood_bank_id' => $slot->bank_id,
            'appointment_time' => $slot->slot_date . ' ' . $slot->start_time,
            'status' => 'pending',
        ]);

        $admin = User::where('role', 'admin')->first();

        if ($admin) {
            Notification::create([
                'user_id' => $admin->id,
                'title' => 'New Appointment',
                'message' => $donorName . ' has booked a new appointment.',
                'type' => 'confirmation',
                'is_read' => false,
            ]);
        }

        Notification::create([
            'user_id' => $userId,
            'title' => 'Appointment Booked',
            'message' => 'Your appointment has been booked successfully and is pending approval.',
            'type' => 'confirmation',
            'is_read' => false,
        ]);

        return response()->json($appointment, 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->headers->set('Accept', 'application/json');
        if (!$request->user() || $request->user()->role !== 'admin') {
        return response()->json(['message' => 'Unauthorized. Admin access only.'], 403);
    }

        $appointment = Appointment::findOrFail($id);
        $appointment->status = $request->status;
        $appointment->save();

        $donor = User::find($appointment->user_id);
        $donorName = $donor ? $donor->full_name : 'The donor';

        $message = match($request->status) {
            'accepted' => 'Your appointment has been accepted!',
            'cancelled' => 'Your appointment has been cancelled.',
            'completed' => 'Your donation has been completed. Thank you!',
            default => 'Your appointment status has been updated.',
        };

        $adminMessage = match($request->status) {
            'accepted' => $donorName . '\'s appointment has been accepted.',
            'cancelled' => $donorName . '\'s appointment has been cancelled.',
            'completed' => $donorName . '\'s donation has been completed.',
            default => $donorName . '\'s appointment status has been updated.',
        };

        if ($request->status === 'completed') {
            if ($donor && $donor->blood_type) {
                BloodInventory::create([
                    'blood_bank_id' => $appointment->blood_bank_id,
                    'blood_type' => $donor->blood_type,
                    'units' => $request->units ?? 1,
                    'expiration_date' => now()->addDays(42)->toDateString(),
                ]);
            }
        }

        Notification::create([
            'user_id' => $appointment->user_id,
            'title' => 'Appointment Update',
            'message' => $message,
            'type' => 'confirmation',
            'is_read' => false,
        ]);

        $admin = User::where('role', 'admin')->first();
        if ($admin) {
            Notification::create([
                'user_id' => $admin->id,
                'title' => 'Appointment Updated',
                'message' => $adminMessage,
                'type' => 'confirmation',
                'is_read' => false,
            ]);
        }

        return response()->json($appointment);
    }

    public function myAppointments(Request $request)
    {
        $appointments = Appointment::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($appointments);
    }
}
