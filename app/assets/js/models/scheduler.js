/**
 * Scheduled tasks manager
 */
(function(require, m)
{

    'use strict';

    var Later = require('later');

    var module = function(callback)
    {

        var scheduleCallback = callback;
        var currentSchedules = [];

        /**
         * Parses and updates a list of scheduled tasks
         * @param schedules
         */
        this.setSchedules = function(schedules)
        {
            currentSchedules.map(function(schedule)
            {
                schedule.clear();
            });
            currentSchedules = [];
            for (var index = 0; index < schedules.length; index += 1)
            {
                var interval = _parseScheduleInterval.apply(this, [schedules[index]]);
                var days = _parseScheduleDays.apply(this, [schedules[index]]);
                if (interval !== false && days !== false)
                {
                    var instance = Later.parse.text(interval + ' ' + days);
                    var callback = schedules[index].backup_type === 'full' ? _onScheduleFull : _onScheduleAuto;
                    currentSchedules.push(Later.setInterval(callback.bind(this), instance));
                }
            }
        };

        /**
         * Reads the requested interval (specific time in the day, or time intervals)
         * @param schedule
         */
        var _parseScheduleInterval = function(schedule)
        {
            if (schedule.interval_type === 'date')
            {
                return 'at ' + schedule.date_hours + ':' + schedule.date_minutes;
            }
            else if (schedule.interval_type === 'interval')
            {
                var minutes = schedule.interval_minutes;
                return minutes < 60 ? 'every ' + minutes + ' mins' : 'every ' + (minutes / 60) + ' hours';
            }
        };

        /**
         * Reads the requested planning (days of month or week)
         * @param schedule
         */
        var _parseScheduleDays = function(schedule)
        {
            if (schedule.interval_basis === 'weekly')
            {
                if (typeof schedule.weekdays.indexOf === 'undefined' || schedule.weekdays.length === 0)
                {
                    return false;
                }
                return 'on the ' + schedule.weekdays.join(',') + ' day of the week';
            }
            else if (schedule.interval_basis === 'monthly')
            {
                if (typeof schedule.monthdays.indexOf === 'undefined' || schedule.monthdays.length === 0)
                {
                    return false;
                }
                return 'on the ' + schedule.monthdays.join(',') + ' day of the month';
            }
        };

        /**
         * Reaches a schedule
         */
        var _onScheduleFull = function()
        {
            scheduleCallback('full');
        };

        /**
         * Reaches a schedule
         */
        var _onScheduleAuto = function()
        {
            scheduleCallback('auto');
        };

    };

    m.exports = module;

})(require, module);