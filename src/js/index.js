import Search from './models/Search';
import Recipe from './models/Recipe'; 
import List from './models/List';
import * as SeachView from './view/searchView';
import * as RecipeView from './view/recipeView';
import * as ListView from './view/listView';
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
            alert(err);
        }
    }
}

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
        console.log(goToPage);
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
            window.r= state.recipe; 

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
            alert(err);
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


}
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
})

//Handling the button serving click

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
    }
});


window.l = new List();

 









































