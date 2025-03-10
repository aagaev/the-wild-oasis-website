"use client";
import {
  differenceInDays,
  isPast,
  isSameDay,
  isWithinInterval,
} from "date-fns";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useReservation } from "./ReservationContext";

function isAlreadyBooked(range, datesArr) {
  return (
    range.from &&
    range.to &&
    datesArr.some((date) =>
      isWithinInterval(date, { start: range.from, end: range.to })
    )
  );
}

function DateSelector({ settings, cabin, bookedDates }) {
  const { range, setRange, resetRange } = useReservation();
  console.log(range);
  // const [range, setRange] = useState({ from: null, to: null });
  //this state is needed for being able to share with other component ReservationForm.js.
  //The question now becomes how can we share this piece of state between these two client components?
  //  So we have diffreent options for doing that. Some of them are:
  //I. First is to store the date in the URL again. with advantage that the page becomes shareable
  // and bookmarkable. So that's what we did earlier with the filter.\
  //II. The second option is to create another component - that wraps both of these components and
  //  then lifts the state up to that parent component. But we already know how to do that. and it's not funny at all
  // So like a parent component that holds the state and then passes the state down to the children.
  //III. And the third option is to actually use the React Context API to share the state between these two components.
  //Now, we just keep in mind thst the Context API is only going to be useful if we have a lot of components that need
  // to share the same state. And main thing that is going to work ONLY for client components, because only those can use the hooks
  //that are nessesary to read the values out of the context.
  // Attention !!! SO, we can't use the context API to share state between the server and the client.
  // In this case, we would have to use the URL as we did in the filter component or the parent component to share the state
  // between the server and the client. But right now, we are only working with client components, so we can use the context API.

  //Attention about I option. Storing the date in the URL - why we shouldn't store the date in the URL? So, storing the date in the URL,
  // so basically each time we would click here and change the date, then as a result we would update the URL that would create
  // a new navigation(page), which in this case is not what we want. We want to keep the user on the same page and just update the state.
  // So, remember again the filter component that we built earlier, so, whenever we clicked on one of the buttons there -
  // the page would navigate to a different URL, which would then trigger and re-render the server component.
  // And, as we alredy know, re-rendering the server component will then re-fetch the data that's on the page.
  // And so that then creates a significant delay in the user experience, because the user has to wait for the
  //  page to re-render and re-fetch the data.
  //So again, in this situation, if we were to click here and then store the date right here in the URL, then it would re-fetch all the data
  // that is nessesary in this server-component page. So we don't want that. So this is definitely not the right solution this time.

  //Also we could use: using a state management library like Redux, a custom hook, a global state management library like Zustand,
  // a global state management library like Recoil, Jotai,  like RTK Query, React Query,  MobX

  // CHANGE
  const { regularPrice, discount } = cabin;

  const displayRange = isAlreadyBooked(range, bookedDates) ? {} : range;

  const numNights = differenceInDays(displayRange.to, displayRange.from);
  // const numNights = differenceInDays(range.to, range.from);
  const cabinPrice = (regularPrice - discount) * numNights;

  // SETTINGS

  const { minBookingLength, maxBookingLength } = settings;

  return (
    <div className="flex flex-col justify-between">
      <DayPicker
        className="pt-12 place-self-center"
        mode="range"
        // onSelect={(range) => setRange(range)}
        // onSelect={(range) => setRange(range)} //same as below
        onSelect={setRange}
        selected={displayRange}
        // selected={range}
        minDate={minBookingLength + 1}
        maxDate={maxBookingLength}
        fromMonth={new Date()}
        fromDate={new Date()}
        toYear={new Date().getFullYear() + 5}
        captionLayout="dropdown"
        numberOfMonths={2}
        disabled={(curDate) =>
          isPast(curDate) ||
          bookedDates.some((date) => isSameDay(date, curDate))
        }
      />

      <div className="flex items-center justify-between px-8 bg-accent-500 text-primary-800 h-[72px]">
        <div className="flex items-baseline gap-6">
          <p className="flex gap-2 items-baseline">
            {discount > 0 ? (
              <>
                <span className="text-2xl">${regularPrice - discount}</span>
                <span className="line-through font-semibold text-primary-700">
                  ${regularPrice}
                </span>
              </>
            ) : (
              <span className="text-2xl">${regularPrice}</span>
            )}
            <span className="">/night</span>
          </p>
          {numNights ? (
            <>
              <p className="bg-accent-600 px-3 py-2 text-2xl">
                <span>&times;</span> <span>{numNights}</span>
              </p>
              <p>
                <span className="text-lg font-bold uppercase">Total</span>{" "}
                <span className="text-2xl font-semibold">${cabinPrice}</span>
              </p>
            </>
          ) : null}
        </div>

        {range.from || range.to ? (
          <button
            className="border border-primary-800 py-2 px-4 text-sm font-semibold"
            onClick={resetRange}
            // onClick={() => resetRange()}
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default DateSelector;
