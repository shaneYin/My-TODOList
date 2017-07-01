;(function() {
    'use strict';

    var $form_add_task = $('.add-task'),
        $task_list = $('.task-list'),
        $task_detail_mask = $('.task-detail-mask'),
        $task_detail = $('.task-detail'),
        $detail_content = $('.detail-content'),
        task_list;

    init();

    $form_add_task.on("submit", function(e) {

      var new_task = {}, 
          $input = $(this).find('input[name=content]');
      new_task.content = $input.val();
      // 如果task_list数组长度为0，id值就为0，如果不是长度不为0，
      // 则设置为最后一个元素的 id + 1，模仿数组特性。
      new_task.id = task_list.length === 0 ? 0 : task_list[task_list.length - 1].id + 1;

      if (!new_task.content) return;

      if(add_task(new_task)) {
            
        render_task_list();
        $input.val(null);
      }

      e.preventDefault();

    });

    $task_list.delegate("#delete", "click", function(e) {
      
      var id = $(this).parent().attr('data-id');

      var tmp = confirm('确定删除此项吗？');

      var remove_result = tmp ? remove_task(id) : null;
      console.log("删除结果：" + remove_result);

      // 阻止事件冒泡
      return false;
    });

    $task_list.delegate("#detail", "click", function() {   

      var $this_task_item = $(this).parent();
      var id = $this_task_item.attr("data-id");

      show_task_detail(id);
    });

    $task_detail_mask.on("click", function() {

      hide_task_detail();
    });

    $task_detail.delegate(".task_detail_btn", "click", function(e) {

      var desc_content = $("#desc").val();
      var date_content = $("#date").val();
      var $task_detail_input = $(".task_detail_input");
      var input_val = $task_detail_input.length ? $task_detail_input.val() : null;
      var id = $(this).parent().parent().attr("data-id");

      updata_detail_desc(input_val, desc_content, date_content, id);
      hide_task_detail();
      
      return false;
    });

    $task_detail.delegate('.detail-content', "dblclick", function() {

      var $this = $(this);
      var val = $(this).children().text();

      $this.html('<input type="text" value="' + val + '" class="task_detail_input"/>');

      return false;
    });

    function add_task (new_task) {
      // 把新任务添加到task_list数组里面
      task_list.push(new_task);
      // 然后更新localstorage
      store.set('task_list', task_list);
      return true;
    }

    function remove_task(id) {
      var remove_item;

      for(var i = 0; i < task_list.length; i++) {

        if(task_list[i].id == id) {

          remove_item = task_list.splice(i, 1);
          store.set('task_list', task_list);

          render_task_list();

          return remove_item;
        }
      }
      return false;
    }

    function show_task_detail(id) {

      render_task_detail(id);
      $task_detail_mask.show();
      $task_detail.show();
    }

    function hide_task_detail() {

      $task_detail_mask.hide();
      $task_detail.hide();
    }

    // 渲染全部任务项
    function render_task_list() {
      console.time("渲染所需时间");
      var renderDOM = "";

      for(var i = 0; i < task_list.length; i++) {
        // 保存函数返回的DOM字符串
        var task_item_dom = task_item_module(task_list[i]);
        // 将其添加到renderDOM里面
        renderDOM += task_item_dom;
      }
      $task_list.html(renderDOM);
      console.timeEnd("渲染所需时间");
    }

    // 更新任务项，包括添加和删除。
    function refresh_task_list() {

    }
    
    // 渲染详情面板
    function render_task_detail(id) {

      var renderDOM = "";

      for(var i = 0; i < task_list.length; i++) {

        if(task_list[i].id == id) {

          var task_detail_dom = task_detail_module(task_list[i]);

          renderDOM += task_detail_dom;

        }
      }
      $task_detail.html(renderDOM);
    }

    // 更新详情数据（添加desc属性到task_list中）
    function updata_detail_desc(input_val, desc_content, date_content, id) {

      if (input_val) {

        for (var i = 0; i < task_list.length; i++) {

          if (task_list[i].id == id) {

            task_list[i].content = input_val;
            // 更新localStorage
            store.set('task_list', task_list);
            render_task_list();
          }
        }
      }
      for (var i = 0; i < task_list.length; i++) {

        if (task_list[i].id == id) {

          task_list[i].desc = desc_content;
          task_list[i].date = date_content;
          // 更新localStorage
          store.set('task_list', task_list);
        }
      }

    }

    // 保存添加项的模板
    function task_item_module(data){

      if (data && typeof data === "object") {
        var list_item_tpl = 
          '<div class="task-item" data-id="'+ data.id +'">'+
            '<span><input type="checkbox"></span>'+
            '<span class="task-content">' + data.content + '</span>'+
            '<a href="javascript:void(0)" class="anchor" id="delete">删除</a>'+
            '<a href="javascript:void(0)" class="anchor" id="detail">查看</a>'+
          '</div>';

        return list_item_tpl;
      }
      
      return false;
    }

    //保存添加详情的模板
    function task_detail_module(data) {

      if (data && typeof data === "object") {
        var task_detail_tpl = 
          '<div data-id="' + data.id + '">'+
            '<div class="detail-content">'+
              '<h2>' + data.content + '</h2>'+
            '</div>'+
            '<div class="desc">'+
              '<textarea value="" id="desc">' + (data.desc ? data.desc : "") + '</textarea>'+
            '</div>'+
            '<div class="remind">'+
              '<input type="date" id="date" value="' + (data.date ? data.date : "") + '">'+
              '<button type="submit" class="task_detail_btn">更新</button>'+
            '</div>'+
          '</div>';

        return task_detail_tpl;
      }

      return false;
    }

    function init() {

      task_list = store.get('task_list') || [];
      
      render_task_list();

    }
})();