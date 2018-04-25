/*global Clipboard*/
/*global toastr*/
/*global $*/
(function() {
  window.onload = function() {
    new Clipboard('.titlebox');
    new Clipboard('.btn');
    new Clipboard('.icon');
    toastr.options = {
      'closeButton': true,
      'debug': false,
      'newestOnTop': false,
      'progressBar': false,
      'positionClass': 'toast-top-right',
      'preventDuplicates': false,
      'onclick': null,
      'showDuration': '300',
      'hideDuration': '1000',
      'timeOut': '5000',
      'extendedTimeOut': '1000',
      'showEasing': 'swing',
      'hideEasing': 'linear',
      'showMethod': 'fadeIn',
      'hideMethod': 'fadeOut'
    };
    $('.titlebox').bind('click', function(e) {
      toastr['success']('复制成功' + $(this).text() + ',复制描述地址');
    });
    $('.btn').bind('click', function(e) {
      toastr['success']('复制成功' + $(this).text() + ',复制接口链接');
    });
    $('.icons [class^=icon-]').bind('click', function(e) {
      toastr['success']('复制成功' + $(this).attr('class') + ',复制icon图标');
    });
    $('#go_top').bind('click', function(e) {
      $(window).scrollTop(0);
    });
    $('#download').bind('click', function() {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/test/file', true);
      xhr.responseType = 'blob';
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onload = function(e) {
        if (this.status == 200) {
          // get binary data as a response
          var blob = this.response;
          var link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = 'file.png';
          link.click();
        }
      };
      xhr.send(JSON.stringify({ name: 'xuezi' }));
    });
  };
}());