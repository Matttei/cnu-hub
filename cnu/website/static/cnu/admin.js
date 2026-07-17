// Add function for unpin events
document.addEventListener('DOMContentLoaded', function(){
    // Utility function to show messages
    function showMessage(message, isSuccess = false) {
        const messageEl = document.createElement('div');
        messageEl.className = 'message';
        messageEl.innerHTML = message;

        if (isSuccess) {
            messageEl.style.backgroundColor = '#d4edda';
            messageEl.style.color = '#155724';
        }

        document.body.appendChild(messageEl);

        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }
    document.querySelectorAll('.unpin-btn').forEach(btn =>{
        
        btn.addEventListener('click', function(event){
            event.preventDefault();
            const eventId = this.getAttribute('data-post-id');
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            console.log(eventId);
            // Fetch the data and send to backend

            fetch('/unpin/', {
                method: 'POST',
                headers:{
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify({
                    id: eventId,
                })
            })
            .then(response => response.json())
            .then(data =>{
                if (data.success){
                    showMessage(data.message, true)
                    // Eliminam div-ul cu anuntul pinned
                    const divElem = document.getElementById(`postid-${eventId}`);
                    divElem.classList.add('d-none')
                }
                else{
                    showMessage(data.message, false)
                }
            })
            .catch(error => console.error('Error:', error));
        });
    });
});