mtg-expected-value
==================

This is just a simple bit of javascript for calculating expected value of tournaments - the most interesting part is probably the tournament pairer, which is a recursive method for creating swiss or single elimination pairings.  It includes a page with a bit of angular that lets you quickly change all of the values.

To Do:
Add odd numbered tournaments / byes (my plan here is to just insert a player with -Infinity rating into the array in a random position.)
