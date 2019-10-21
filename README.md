# Lifering

A helper tool to allow for easier backup and restore of Postgres databases

## About

Initially built as a small tool for a Checkout inventory system that I was working on at one of my jobs, I broke it out into a seperate tool in case it was interesting/useful for anyone else

## Installation

```
npm install -g lifering
```

## Usage

Get a list of commands using

```
lifering help
```

### Automatic scheduling

The schedule command spins up a javascript cron job, but ties up the thread using it, so it was intended to be used in conjunction with something like `pm2` that could be started at startup and just spin up the schedule command.

For example:

```
pm2 start lifering -- schedule [DB_NAME]
```
