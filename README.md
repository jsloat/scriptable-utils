[Scriptable](https://scriptable.app/) is a wonderful iOS/iPadOS app that provides a JavaScript IDE and access to system APIs like reminders, calendar, and notifications. Although it works great out-of-the-box, this set of guides will walk you through setting up a more mature environment that will enable you to quickly create interactive applications.

This package contains a bunch of utilities to make it easier to build interactive elements and use iOS API bridges in Scriptable.

My development experience is primarily with React & RxJS; if you're familiar with these frameworks, you'll notice a lot of inspiration taken from them.

# Example utils

## getTable

Creates a `UITable` with optional state and props. Calling this function returns utilities for working with the table, e.g.:

- `present` - Presents the table. The return value of this function is `Promise<State>` (i.e. if your table has state, the final state is returned).
- `connect` - A helper function for composing components used in the table.
- `isTableActive` - A function to check whether the table is currently active.

## UITable components

A number of premade components you can use for table layout. These components, and any table generated using `getTable`, have appropriate light mode/dark mode styling.

Some examples:

- `Button`
- `DetailCard`
- `H1`, `H2`
- `Span`
- `P` (paragraph)
- `ProgressBar`
- `Table` (table inception)
- `Toast` (notification banners)

## User input components

Many of these are just wrappers on top of the input options available in Scriptable (e.g. different flavors of the `Alert` class), and some are `UITable`s.

Some examples:

- `form` - A form component that supports validation and 13 field types. The form fields are also available for individual use (e.g. `DropdownField`).
- `confirm` - Dialog to prompt user to confirm an action
- `OK` - Simple dialog to acknowledge a message
- `listChoose` - Fullscreen option selection
- `textArea` - Fullscreen text input box
- `textInput` - Regular text input

# What is this for?

For a long time I used iOS Reminders as my primary task tracker. There are some apps that add functionality on top of Reminders, like [GoodTask](http://goodtaskapp.com/) (it's great), but beyond that, you're essentially stuck with what Apple gives you.

With Scriptable, you have full access to your reminders; you can delete all of them, search for what you want, display them how you like, or even build a sync between Reminders and a 3rd-party task manager with an API (like [Todoist](https://todoist.com/)).

Same with your calendar, files in iCloud, photos...etc. Scriptable provides a bridge to data that is otherwise very locked down by Apple.
