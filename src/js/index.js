import Search from './models/Search';
import Recipe from './models/Recipe'; 
import List from './models/List';
import Likes from './models/Likes';
import * as SeachView from './view/searchView';
import * as RecipeView from './view/recipeView';
import * as ListView from './view/listView';
import * as LikesView from './view/likesView';
import {element,renderLoader,clearLoader} from './view/base';

/** Global State of app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked object
 */
const state={};


/**
 * SEARCH CONTROLLER
*/
const controlSearch = async () => {
    const query = SeachView.getInput();

    if (query){
        //2) New object and add to state
        state.search = new Search(query);

        //3)Prepare for UI
        SeachView.clearInput();
        SeachView.clearResults();
        renderLoader(element.searchRes);

        //4)Search for recipes
        try{
            await state.search.getResults();

            //5)Render the result
            clearLoader();
            SeachView.renderResults(state.search.result,1);
        }catch(err){
            console.log(err);
        }
    }
}

//Handling submit and click for Search and result
element.searhForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});
window.addEventListener('load', e => {
    e.preventDefault();
    controlSearch();
});

element.searchResPages.addEventListener('click', e=>{
    const btn= e.target.closest('.btn-inline');
    if(btn){
        const goToPage= parseInt(btn.dataset.goto,10);
        SeachView.clearResults();
        SeachView.renderResults(state.search.result,goToPage);
    }
});

/**
 * RECIPE CONTROLLER
*/

const controlRecipe =async()=>{
    //1.Get the ID from url
    const id= window.location.hash.replace('#', '');

    
    if(id){
            //Prepare for UI change
            RecipeView.clearRecipe();
            renderLoader(element.recipe);

            //Highlight selected Id
            if (state.recipe) SeachView.highlightSelectedID(id); 

            //Create new recipe object
            state.recipe = new Recipe(id);
        try{                
                //Get Recipe data  and parse ingredient
                await state.recipe.getRecipe();
                state.recipe.parseIngredients();

                //calculate time and serving
                state.recipe.calcTime();
                state.recipe.calcServings();

                //render on UI
                clearLoader();
                RecipeView.renderRecipe(state.recipe);
        }catch(err){
            console.log(err);
        }     
    }
  
}


['hashchange','load'].forEach(event=> window.addEventListener(event,controlRecipe));

/**
 * LIST CONTROLLER
*/

const controlList=()=>{
    //Create a new list 
    if(!state.list) state.list= new List();

    // Add each ingredient to list

    state.recipe.ingredients.forEach(el=>{
        const item= state.list.addItem(el.count, el.unit, el.ingredient); 
        ListView.renderItem(item);
    })
};




/**
 * LIKES CONTROLLER
*/
const controlLikes= ()=>{

    if(!state.likes) state.likes= new Likes();

    const currentID= state.recipe.id;

    //User has NOT liked current recipe
    if(!state.likes.isLiked(currentID)){
        //Add like to state
        const newLike= state.likes.addLikes(currentID,state.recipe.title,state.recipe.author, state.recipe.img);
        //Toggle the button
        LikesView.toggleLikeButton(true);
        //Render like to UI list
        LikesView.renderLikes(newLike);

    }//User has liked current recipe
    else{
        //Remove like to state
        state.likes.deleteItem(currentID);
        //Toggle the button
        LikesView.toggleLikeButton(false);
        //Render like to UI list 
        LikesView.deleteLike(currentID); 
    }
    LikesView.toggleLikeMenu(state.likes.getNumLikes());
    
}

// Restore liked recipes when page loads

window.addEventListener('load',()=>{
    state.likes= new Likes();

    //Restore Like
    state.likes.readStrorage();


    //Toggle the like button
    LikesView.toggleLikeMenu(state.likes.getNumLikes());

    //Render the existing likes
    state.likes.likes.forEach( like=>{
        LikesView.renderLikes(like);
    });

})


//Handling the button servings click

element.recipe.addEventListener('click',e=>{
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
        if(state.recipe.servings>1){
            state.recipe.updateServings('dec');
            RecipeView.updateServingsIngredients(state.recipe);
        }
    }else if(e.target.matches('.btn-increase, .btn-increase *')){
        state.recipe.updateServings('inc');
        RecipeView.updateServingsIngredients(state.recipe);
    }else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        controlList();
    }else if(e.target.matches('.recipe__love, .recipe__love *')){
        controlLikes();
    }
});

//Handling the delete item of list and update 

element.shopping.addEventListener('click',e=>{
    const id = e.target.closest('.shopping__item').dataset.itemid;

    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        state.list.deleteItem(id); 

        ListView.deleteItem(id);
    }else if(e.target.matches('.shopping__count-value, .shopping__count-value *')){
        const val= parseFloat(e.target.value,10);
        state.list.updateCount(id, val);
    }
});






 









































