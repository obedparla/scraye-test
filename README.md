# Scraye Test - Obed Parlapiano

[Deployed here](https://scraye-test.vercel.app/)

This project generates scheduling slots for viewing a property. Each slot is in 30min intervals, only on weekdays.

The slots take into account the client's current time and timezone, so the user will only see viewings for the next 30
minutes intervals.

## Technical decisions

The requirements mentioned to keep the code as simple as possible. I tried to balance simplificity while considering
this as an "MVP" that would need further improvements later.

- I'm using Next.js as a scaffolding. Just assuming this may grow into a more complex app that requires backend. For a
  pure frontend app I would have used Vite instead.
    - I would have used HTMX in other circumstances, but given the time constrains I chose React as I'm familiar with
      it.
- To handle dates and timezones I chose `date-fns` and `date-fns-tz`. They offer an intuitive and simple to use API.
    - Using timezone wasn't necessary, but I thought to add a switch to change timezones and adapt the slots, but that
      would've added complexity. I left the timezone code in place as a way to extend functionality further down the
      road.
- For styling I chose Tailwind, along Shadcn/ui for components to simplify the UI creation.
- I added Zustand for "state management". This is a single component app, so not necessary, but given how simple
  a Zustand store is, I wanted to extract the core state (slots) onto a store, as I would in a real app.