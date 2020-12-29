<template>
<div>
  <a-card :bordered="false" title="Add comment" v-show="showForm" >
    <a-form :form="form" @submit="handleSubmit">
    <a-form-item label="Title">
      <a-input
        v-decorator="['title', { rules: [{ required: true }] }]"
      />
    </a-form-item>
    <a-form-item label="Content">
      <a-input
        v-decorator="['content', { rules: [{ required: true }] }]"
      />
    </a-form-item>
    <a-form-item >
      <a-row type='flex'>
        <a-col :span="12">
      <a-button type="primary" html-type="submit">
        Submit
      </a-button>
        </a-col>
        <a-col :span="12">
      <a-button type="primary" @click="hideForm">
        Cancel
      </a-button>
        </a-col>
      </a-row>
    </a-form-item>
  </a-form>
  </a-card>
  <a-card :bordered="false">
    <a-list
      class="comment-list"
      item-layout="horizontal"
      :data-source="data"
      style="height:auto;"
    >
    <template slot="header" style="position:relative">
      {{data.length}} Comments Added
      <a-button @click="addComment" style="position:absolute;right:10">ADD</a-button>
    </template>
      <a-list-item slot="renderItem" slot-scope="item">
        <a-comment :author="item.userName">
          <template slot="actions">
            <span v-for="action in item.actions" :key="action">
              <a-popconfirm
                title="确定删除吗？"
                @confirm="deleteAction(item)"
                okText="是"
                cancelText="否"
                style="margin-left:8px"
                v-if="action=='Delete'"
              >Delete</a-popconfirm>
            </span>
          </template>
          <p slot="content">
            <b>{{item.title}}</b>
            <br />
            {{ item.content }}
          </p>
          <a-tooltip slot="datetime" :title="item.createTime.format('YYYY-MM-DD HH:mm:ss')">
            <span>{{ item.createTime.fromNow() }}</span>
          </a-tooltip>
        </a-comment>
      </a-list-item>
    </a-list>
  </a-card>
  </div>
</template>

<script>
import moment from "moment";
export default {
  beforeCreate() {},
  computed: {
    all() {
      console.log(this.$store.state.all);
      return this.$store.state.all;
    },
    user() {
      return this.$store.state.user;
    },
    current() {
      return this.$store.state.current;
    },
    focusNode() {
      return this.$store.state.focusNode;
    },
    focusEdge() {
      return this.$store.state.focusEdge;
    },
    focusDomain() {
      return this.$store.state.selectedDomain;
    },
    type() {
      return this.$store.state.type;
    },
    ifSelect() {
      return this.$store.state.ifSelect;
    }
  },
  watch: {
    ifSelect() {
      if (this.ifSelect == 1) {
        if (this.type == "node") {
          this.id = this.focusNode.id;
        } else if (this.type == "edge") {
          this.id = this.focusEdge.id;
        } else {
          this.id = this.focusDomain;
        }
        this.refreshComment();
        this.$store.commit("changeIfSelect", 0);
      }
    }
  },
  data() {
    return {
      // threshold: 0,
      id: 0,
      data: [],
      moment,
      showForm: false,
      form: this.$form.createForm(this, { name: 'coordinated' }),

    };
  },
  methods: {
    refreshComment() {
      let that = this;
      this.$axios
        .get("/api/comment/getOne?type=" + this.type + "&relatedId=" + that.id)
        .then(function(res) {
          if (res.data.success) {
            that.data = [];
            let allComments = res.data.content;
            allComments.forEach(function(c) {
              let tmp = {
                id: c.id,
                userId: c.userId,
                userName: c.userName,
                title: c.title,
                content: c.content,
                createTime: moment(c.createTime),
                type: c.type,
                relatedId: c.relatedId
              };
              console.log(that.user);
              if (tmp.userId == that.user.id) {
                tmp.actions = ["Delete"];
              }
              that.data.push(tmp);
            });
          } else {
            console.log(res.data.message);
          }
        });
    },
    deleteAction(item) {
      let that = this;
      this.$axios
        .get(
          "/api/comment/delete?commentId=" +
            item.id +
            "&relatedId=" +
            item.relatedId +
            "&type=" +
            item.type
        )
        .then(function(res) {
          if (res.data.success) {
            that.refreshComment();
          } else {
            console.log(res.data.message);
          }
        });
    },
    addComment(){
      this.showForm = true;
    },
    hideForm(){
      this.showForm = false;
    },
    handleSubmit(e){
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log(values);
          let commentForm = {
            title:values.title,
            content: values.content,
            type:this.type,
            relatedId:this.id,
            userId:this.user.id,
            userName:this.user.name
          }
          this.$axios.post("/api/comment/add",commentForm).then(res => {
            if(res.data.success){
              this.showForm = false;
              this.refreshComment();
              this.form.resetFields();
            }else{
              console.log(res.data.message);
            }
          })
        }
      });
      
    }
  }
};
</script>

<style scoped>
</style>