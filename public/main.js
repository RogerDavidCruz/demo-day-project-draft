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
