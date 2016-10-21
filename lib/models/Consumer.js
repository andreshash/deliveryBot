import { setConsumer } from '../actions/index';

const Consumer = Parse.Object.extend('Consumer', {
    initialize: function (attrs, options) {
        /*var user = attrs.user;
        console.log('Consumer user param');
        console.log(user);
        this.set('name', user.get('first_name')+" "+user.get('last_name'));
        this.set('user', {
            __type: "Pointer",
            className: "User",
            objectId: user.id
        });
        console.log(this.get('user'))*/
    },
    setUser: function(user){
        this.set('name', user.get('first_name')+" "+user.get('last_name'));
        this.set('user', {
            __type: "Pointer",
            className: "_User",
            objectId: user.id
        });
    },
    saveInStore: function(store){
        return store.dispatch(setConsumer(this.get('recipientId'), this)).fail(error => {
            console.log('Error code: ' + error.message);
        });
    }
});

export default Consumer