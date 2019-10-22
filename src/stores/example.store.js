import { observable, decorate, action } from 'mobx';

class ExampleStore{
    first = "hello";
}

decorate(ExampleStore,{first:observable});

export default new ExampleStore;

