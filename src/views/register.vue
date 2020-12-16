<template>
<div>
  <div class="center-in-center2"><img src="../assets/preview.gif"></div>
<div class="center-in-center">
    <div style="text-align:center;font-size:40px">CodeNeuron</div>
    <br>
    <br>
  <a-tabs defaultActiveKey="1" style="width:400px">
    <a-tab-pane key="1">
      <span slot="tab">
        <a-icon type="user" />
        User
      </span>
      <a-form :form="form" @submit="handleSubmit">
    <a-form-item>
      <span slot="label">
        Username&nbsp;
        <a-tooltip title="What do you want others to call you?">
          <a-icon type="question-circle-o" />
        </a-tooltip>
      </span>
      <a-input
        v-decorator="[
          'username',
          {
            rules: [{ required: true, message: 'Please input your username!', whitespace: true }],
          },
        ]"
      />
    </a-form-item>
    <a-form-item label="Password" has-feedback>
      <a-input
        v-decorator="[
          'password',
          {
            rules: [
              {
                required: true,
                message: 'Please input your password!',
              },
              {
                validator: validateToNextPassword,
              },
            ],
          },
        ]"
        type="password"
      />
    </a-form-item>
    <a-form-item label="Confirm Password" has-feedback>
      <a-input
        v-decorator="[
          'confirm',
          {
            rules: [
              {
                required: true,
                message: 'Please confirm your password!',
              },
              {
                validator: compareToFirstPassword,
              },
            ],
          },
        ]"
        type="password"
        @blur="handleConfirmBlur"
      />
    </a-form-item>
    <a-form-item>
      <a-checkbox v-decorator="['agreement', { valuePropName: 'checked' }]">
          I take all responsibilities during code analysis
      </a-checkbox>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit" style="width:100%">
        Register
      </a-button>
    </a-form-item>
    <a-form-item>
      <a href="login">
        Back to login
      </a>
    </a-form-item>
  </a-form>
    </a-tab-pane>
    <a-tab-pane key="2">
      <span slot="tab">
        <a-icon type="android" />
        Administrator
      </span>
      <a-form :form="form" @submit="handleSubmitAdmin">
    <a-form-item>
      <span slot="label">
        Username&nbsp;
        <a-tooltip title="What do you want others to call you?">
          <a-icon type="question-circle-o" />
        </a-tooltip>
      </span>
      <a-input
        v-decorator="[
          'username',
          {
            rules: [{ required: true, message: 'Please input your username!', whitespace: true }],
          },
        ]"
      />
    </a-form-item>
    <a-form-item label="Password" has-feedback>
      <a-input
        v-decorator="[
          'password',
          {
            rules: [
              {
                required: true,
                message: 'Please input your password!',
              },
              {
                validator: validateToNextPassword,
              },
            ],
          },
        ]"
        type="password"
      />
    </a-form-item>
    <a-form-item label="Confirm Password" has-feedback>
      <a-input
        v-decorator="[
          'confirm',
          {
            rules: [
              {
                required: true,
                message: 'Please confirm your password!',
              },
              {
                validator: compareToFirstPassword,
              },
            ],
          },
        ]"
        type="password"
        @blur="handleConfirmBlur"
      />
    </a-form-item>
    <a-form-item
      label="Invitation Code" has-feedback
      extra="We must make sure that your are qualified."
    >
      <a-row :gutter="8">
        <a-col :span="12">
          <a-input
            v-decorator="[
              'code',
              { rules: [{ required: true, message: 'Please input the Invitation Code!' }] },
            ]"
          />
        </a-col>
      </a-row>
    </a-form-item>
    <a-form-item>
      <a-checkbox v-decorator="['agreement', { valuePropName: 'checked' }]">
          I take all responsibilities during platform administration
      </a-checkbox>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit" style="width:100%">
        Register
      </a-button>
    </a-form-item>
    <a-form-item>
      <a href="login">
        Back to login
      </a>
    </a-form-item>
  </a-form>
    </a-tab-pane>
  </a-tabs>
  
</div>
</div>
</template>

<script>

export default {
  data() {
    return {
      confirmDirty: false,
    };
  },
  beforeCreate() {
    this.form = this.$form.createForm(this, { name: 'register' });
  },
  methods: {
    compareToFirstPassword(rule, value, callback) {
      const form = this.form;
      if (value && value !== form.getFieldValue('password')) {
        callback('Two passwords that you enter is inconsistent!');
      } else {
        callback();
      }
    },
    validateToNextPassword(rule, value, callback) {
      const form = this.form;
      if (value && this.confirmDirty) {
        form.validateFields(['confirm'], { force: true });
      }
      callback();
    },
    handleConfirmBlur(e) {
      const value = e.target.value;
      this.confirmDirty = this.confirmDirty || !!value;
    },
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values);
          const data={
            name:values.username.toString(),
            password:values.password.toString()
          }
          this.$axios.post('/api/user/registerUser',data).then(function(res){
            if(res.data.success){
                window.location.href='login';
                this.$message.success("注册成功!");
            }
            else {
              this.$message.error("注册失败，请重试！")
            }
          }).catch(function(res){
            console.log(res)
          })
        }
      });
    },
    handleSubmitAdmin(e) {
      e.preventDefault();
      this.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values);
          if(values.code.toString()!=='codeneuronForever'){
              window.location.href='register';
                this.$message.error("邀请码无效!");
          }
          else {
            const data={
                name:values.username.toString(),
                password:values.password.toString()
            }
            this.$axios.post('/api/user/registerAdmin',data).then(function(res){
                if(res.data.success){
                    window.location.href='login';
                    this.$message.success("注册成功!");
                }
                else {
                    this.$message.error("注册失败，请重试！")
                }
            }).catch(function(res){
                console.log(res)
            })
          }
        }
      });
    },
  },
};
</script>

<style scoped>

.center-in-center2{
    position: absolute;
    top: 50%;
    left: 30%;
    -webkit-transform: translate(-50%, -50%);
    -moz-transform: translate(-50%, -50%);
    -ms-transform: translate(-50%, -50%);
    -o-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
}

.center-in-center{
    position: absolute;
    top: 50%;
    left: 70%;
    -webkit-transform: translate(-50%, -50%);
    -moz-transform: translate(-50%, -50%);
    -ms-transform: translate(-50%, -50%);
    -o-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
}
</style>