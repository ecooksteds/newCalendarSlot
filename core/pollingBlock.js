class pollingBlock{
    constructor(date, timeStart, timeEnd, userID)
    {
        this.date = date;
        this.timeStart = timeStart;
        this.timeEnd = timeEnd; 
    }

    get getTimeStart(){
        return this.timeStart;
    }

    get getTimeEnd(){
        return this.timeEnd;
    }

    get getDate(){
        return this.date;
    }
}

module.exports = pollingBlock;