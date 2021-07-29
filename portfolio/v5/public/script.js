
$("form").show();
$("#new").hide();
    $("#update").hide();
    $('#select').on('change', () => {
        if($('#select').val() === 'new'){
            $("#new").show();
            $("#update").hide();
            $("#form").css("height", "100%");
        } else {
            $("#new").hide();
            $("#update").show();
            $("#form").css("height", "100%");
        }
    })