"use server";

import { th } from "date-fns/locale";
import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";
import { revalidatePath } from "next/cache";
import { getBookings } from "./data-service";
import { redirect } from "next/navigation";

export async function signInAction() {
  await signIn("google", {
    redirectTo: "/account",
  });
}
export async function signOutAction() {
  await signOut({
    redirectTo: "/",
  });
}
export async function updateGuest(formData) {
  const session = await auth();
  if (!session) throw new Error("Not authenticated, you must be logged in");
  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");
  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID))
    throw new Error("Invalid national ID, please provide a valid National ID");

  const updateData = {
    nationality,
    countryFlag,
    nationalID,
  };
  console.log(updateData);

  const { data, error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", session.user.guestId)
    // .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Guest could not be updated");
  }
  revalidatePath("/account/profile");
  return data;
}

export async function updateBooking(formData) {
  console.log(formData);
  const bookingId = Number(formData.get("bookingId"));
  console.log(`Booking ID: ${bookingId}`);
  if (!Number.isInteger(bookingId))
    throw new Error("Invalid booking ID, please provide a valid booking ID");
  //1) Here we're doing the Authentication
  const session = await auth();
  if (!session) throw new Error("Not authenticated, you must be logged in");

  //2) Then this is basically like an Authorization
  // so seeing if we are actually authorized to do this
  // we're checking if the user is allowed to update this booking

  const guestBookings = await getBookings(session.user.guestId);
  console.log(`Guest Bookings: ${JSON.stringify(guestBookings)}`);
  if (!Array.isArray(guestBookings)) {
    console.error("Guest bookings data is not an array:", guestBookings);
    throw new Error("Could not retrieve guest bookings");
  }
  const guestBookingIds = guestBookings.map((booking) => booking.id);
  console.log(`Guest Booking IDs: ${guestBookingIds}`);
  if (!guestBookingIds.includes(bookingId))
    throw new Error("You can only update your own bookings");

  //3) Building update data
  const updateData = {
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
  };

  //4) Mutation
  const { data, error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId)
    .select()
    .single();

  //5) Error handling
  if (error) {
    console.error(error);
    throw new Error("Booking could not be updated");
  }
  //6) Revalidation
  revalidatePath(`/account/reservations/edit/${bookingId}`);
  revalidatePath("/account/reservations");
  //7) Redirection
  redirect("/account/reservations");
}

export async function createBooking(bookingData, formData) {
  // console.log(formData);
  const session = await auth();
  if (!session) throw new Error("Not authenticated, you must be logged in");

  // console.log(Object.fromEntries(formData.entries()));//this is to see the form data and if we have a huge form data we can see it in the console
  // const data = Object.fromEntries(formData.entries());
  // const newBooking = {
  //   ...bookingData,
  //   ...data,
  // };
  const newBooking = {
    ...bookingData,
    guestId: session.user.guestId,
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
    extrasPrice: 0,
    totalPrice: bookingData.cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
  };

  console.log(newBooking);
  const { data, error } = await supabase
    .from("bookings")
    .insert([newBooking])
    // So that the newly created object gets returned!
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not be created");
  }

  revalidatePath(`/cabins/${bookingData.cabinId}`);
  redirect("/cabins/thankyou");

  return data;
}

export async function deleteBooking(bookingId) {
  const session = await auth();
  if (!session) throw new Error("Not authenticated, you must be logged in");

  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingIds = guestBookings.map((booking) => booking.id);
  if (!guestBookingIds.includes(bookingId))
    throw new Error("You can only delete your own bookings");

  const { data, error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId)
    .select()
    .single();

  if (error) {
    throw new Error("Booking could not be deleted");
  }
  revalidatePath("/account/reservations");
}
