var putIngredient = document.getElementsByClassName("btn-ingredient");
var trash = document.getElementsByClassName("fa-trash");

Array.from(putIngredient).forEach(function(element) {
      element.addEventListener('click', function(e){
        e.preventDefault()
        const ingredient = document.getElementById('ingredient').value;
        fetch('foods', {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            'ingredient': ingredient,
          })
        })
        .then(data => {
          console.log(data)
          window.location.reload()
        })
      });
});

Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(e){
        e.preventDefault()
        const allergens = this.parentNode.parentNode.childNodes[1].innerText
        console.log(allergens)
        fetch('foods', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'foods' : foods[i],
            'ingredient': allergens,
            //'foodToDelete': allergens,
            //'foodToDelete': allergens,
            //'user': user_id
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});
