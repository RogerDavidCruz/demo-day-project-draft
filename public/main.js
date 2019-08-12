var trash = document.getElementsByClassName("fa-trash");

Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(){
        const allergens = this.parentNode.parentNode.childNodes[1].innerText
        console.log(allergens)
        // const msg = this.parentNode.parentNode.childNodes[3].innerText
        fetch('foods', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'foods': allergens
          })
        }).then(function (response) {
          // window.location.reload()
        })
      });
});

for (var i = 0; i < food.length; i++) {
  array[i]
}

//======QUESTIONS FOR Optimizations======//
//if we have more than one item that is okay to eat,
// do we want to return all or do we want to maybe do a randomazation for
// a dish?

//=======KEY POINTS========//
// **so if we get a large obj back from the API that has all the dishes available**
// we want to remove the dishes thatt contain
// ingredients that match the alergens the user has input
// use of the 2 api's to check for what is approproiate for the client


// portSteak {
//   steak: beef,
//   pepper: redPeppers,
//   sauce: beer
// }
//
// if (portSteak) {
//   portSteak.sauce ==//the user has input an alergy to beer
//   return "cant eat";
// }
// continue;
