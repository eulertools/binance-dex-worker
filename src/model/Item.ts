const TAGS = ['crypto','pair']

const CATEGORY = 'currency';

const SOURCE = "binance.com";

const LOCATION = 'global';

class Item {

    public title:string;

    public category:string;

    public magnitude:string;

    public tags:string[];

    public value:number;

    public source:string;

    public timestamp:number;
    
    public location:string;

    public constructor(title:string,magnitude:string, value:number,timestamp:number) {

        this.title = title;
        this.magnitude = magnitude;
        this.category = CATEGORY;
        this.tags = TAGS;
        this.value = value;
        this.source = SOURCE;
        this.timestamp = timestamp;
        this.location = LOCATION;
    }
}

export default Item;