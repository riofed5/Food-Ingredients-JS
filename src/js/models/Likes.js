export default class Likes{

    constructor(){
        this.likes =[];
    }


    addLikes(id,title,author, img){
        const like = { 
            id,
            title,
            author,
            img
        }

        this.likes.push(like);

        this.persistData();
        return like;
    }
    deleteItem(id){
        const index= this.likes.findIndex(el => el.id===id);
        this.likes.splice(index,1);

        this.persistData();
    }
    
    isLiked(id){
        return this.likes.findIndex(el => el.id===id) !== -1;

    }
    
    getNumLikes(){
        return this.likes.length; 
    }
    persistData(){
        localStorage.setItem('likes',JSON.stringify(this.likes));
    }

    readStrorage(){
        const storage= JSON.parse(localStorage.getItem('likes'));
        
        if(storage){
            this.likes=storage;
        }
    }
}