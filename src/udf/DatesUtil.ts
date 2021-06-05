const SECONDS_IN_DAY:number = 86400;

export default {

    cleanTime(timestamp:number) {
        
        const auxDate = new Date(timestamp * 1000);

        const noTime = new Date(Date.UTC(auxDate.getFullYear(), auxDate.getMonth(), auxDate.getDate()));

        return noTime.getTime() / 1000;
    },
    nextDay(timestamp:number):number {

        return timestamp + SECONDS_IN_DAY;
    },
    lastMinuteDay(timestamp:number):number {

        const auxDate = new Date(timestamp * 1000);

        const noTime = new Date(Date.UTC(auxDate.getFullYear(), auxDate.getMonth(), auxDate.getDate(), 23, 59));

        return noTime.getTime() / 1000;
    },
    getDays(from:number,to:number):number[] {

        let firstDay = this.cleanTime(from);

        const lastDay = this.cleanTime(to);

        const days = [];

        days.push(firstDay);

        while(firstDay < lastDay) {

            firstDay = this.nextDay(firstDay);

            days.push(firstDay);
        }

        return days;
    }
}