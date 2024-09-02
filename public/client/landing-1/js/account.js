$(document).ready(function() {
    $('select[name="work_days[]"]').select2({
        width: '100%',
        placeholder: 'Selecione os dias de trabalho',
        allowClear: true
    });
});

$(document).ready(function() {
    $('select[name="pub_region"]').select2({
        width: '100%',
        dropdownAutoWidth: true
    });
});

$(document).ready(function() {
    flatpickr("#work-time-range-1, #work-time-range-2", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true
    });
});


$(document).ready(function() {
    $('.select2').select2();
});
