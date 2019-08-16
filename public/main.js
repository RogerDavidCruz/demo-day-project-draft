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
        console.log("about to delete", element.id, allergens);
        fetch('foods', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'food' : element.id,
            'ingredient': allergens,
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});
