$(document).ready(function (){
  $('#contact').validate({
    debug: true,
    errorClass: 'alert alert-danger',
    ErrorLabelContainer: '#output-area',
    errorElement: 'div',
    // rules to define good and bad inputs
    // each rule start with the form input element's NAME attributes
    rules: {
      contactName: {
        required: true
      },
      contactEmail: {
        email: true,
        required: true,
      },
      contactMessage: {
        required: true,
        maxlength: 2000,
      }
    },
    messages: {
      contactName: {
        required: 'Name is required.'
      },
      contactEmail: {
        email: 'Please provide a valid email address.',
        required: 'Email is required.'
      },
      contactMessage: {
        required: 'A message is required.',
        maxlength: 'Message must be 2000 characters or less.'
      }
    },
    submitHandler: (form) => {
      $('#contact').ajaxSubmit({
        type: 'POST',
        url: $('contact').attr('action'),
        success: (ajaxOutput) => {
          $('#output-area').css('display', '')
          $('#output-area').html(ajaxOutput)


          if($(".alert-success").length >= 1){
            $('#contact')[0].reset()
          }
        }
      })
    }

  })
})