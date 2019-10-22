export default class ElementsHandler {


    constructor(ctx) {
        this.ctx = ctx;
        this.elements = [];
        this.groups={};
    }

    

    addElement(key, elem,groupKey=null){

        let i = this.elements.findIndex(e => { return (e && e.key) ? e.key === key : false });

        if (i === -1) {
            //console.log("Adding a new element");
            this.elements.push({ key, elem });


        } else {
            console.log("Replacing an existing element");
            this.elements[i] = { key, elem };
        }

        if (groupKey!=null){

            if (!this.groups[groupKey]){
                this.groups[groupKey]=[];
            }
            this.groups[groupKey].push(key);
            
        }


        this.ctx.setState({ elements: this.elements });
    }

    removeElement(key){
        if (this.elements.length < 1) {
            console.log("Could not remove element because this.elements is empty");
        }
        console.log("Removing element with key ",key);
        console.log("from this list",this.elements);

        let i = this.elements.findIndex(e => {
            //console.log("e??",e);
            return e.key === key;
        });

        if (i !== -1) {
            this.elements.splice(i, 1);
            this.ctx.setState({ elements: this.elements });

        } else {
            console.log("Could not remove element?!");
        }
    }

    getElementByKey=(key)=>{
        let i=this.elements.findIndex(e => { return (e && e.key) ? e.key === key : false });
        return i===-1?null:this.elements[i].elem;
        
    }
    getElements = () => {
        return this.elements;
    }

}