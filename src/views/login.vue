<template>
  <div>
    <div class="center-in-center2">
      <img src="../assets/preview.gif" />
    </div>
    <div class="center-in-center">
      <div style="text-align:center;font-size:40px">CodeNeuron</div>
      <br />
      <br />
      <a-tabs defaultActiveKey="1" style="width:400px">
        <a-tab-pane key="1">
          <span slot="tab">
            <a-icon type="user" />User
          </span>
          <a-form
            id="components-form-demo-normal-login"
            :form="form"
            class="login-form"
            @submit="handleSubmit"
          >
            <a-form-item>
              <a-input
                v-decorator="[
          'userName',
          { rules: [{ required: true, message: 'Please input your username!' }] },
        ]"
                placeholder="Username"
              >
                <a-icon slot="prefix" type="user" style="color: rgba(0,0,0,.25)" />
              </a-input>
            </a-form-item>
            <a-form-item>
              <a-input
                v-decorator="[
          'password',
          { rules: [{ required: true, message: 'Please input your Password!' }] },
        ]"
                type="password"
                placeholder="Password"
              >
                <a-icon slot="prefix" type="lock" style="color: rgba(0,0,0,.25)" />
              </a-input>
            </a-form-item>
            <a-form-item>
              <a-checkbox
                v-decorator="[
          'remember',
          {
            valuePropName: 'checked',
            initialValue: true,
          },
        ]"
              >Remember me</a-checkbox>

              <a-button type="primary" html-type="submit" class="login-form-button">Log in</a-button>Or
              <a href="register">register now!</a>
            </a-form-item>
          </a-form>
        </a-tab-pane>
        <a-tab-pane key="2">
          <span slot="tab">
            <a-icon type="android" />Administrator
          </span>
          <a-form
            id="components-form-demo-normal-login"
            :form="form"
            class="login-form"
            @submit="handleSubmitAdmin"
          >
            <a-form-item>
              <a-input
                v-decorator="[
          'userName',
          { rules: [{ required: true, message: 'Please input your username!' }] },
        ]"
                placeholder="Username"
              >
                <a-icon slot="prefix" type="user" style="color: rgba(0,0,0,.25)" />
              </a-input>
            </a-form-item>
            <a-form-item>
              <a-input
                v-decorator="[
          'password',
          { rules: [{ required: true, message: 'Please input your Password!' }] },
        ]"
                type="password"
                placeholder="Password"
              >
                <a-icon slot="prefix" type="lock" style="color: rgba(0,0,0,.25)" />
              </a-input>
            </a-form-item>
            <a-form-item>
              <a-checkbox
                v-decorator="[
          'remember',
          {
            valuePropName: 'checked',
            initialValue: true,
          },
        ]"
              >Remember me</a-checkbox>
              <a-button type="primary" html-type="submit" class="login-form-button">Log in</a-button>Or
              <a href="register">register now!</a>
            </a-form-item>
          </a-form>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script>
export default {
  beforeCreate() {
    this.form = this.$form.createForm(this, { name: "normal_login" });
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log("Received values of form: ", values);
          const data = {
            name: values.userName.toString(),
            password: values.password.toString()
          };
          let that = this;
          that.$axios
            .post("/api/user/loginUser", data)
            .then(function(res) {
              if (res.data.success) {
                localStorage.name = res.data.content.name;
                localStorage.id = res.data.content.id;
                window.location.href = "homepage";
              } else {
                that.$message.info(res.data.message);
              }
            })
            .catch(function(res) {
              console.log(res);
            });
        }
      });
    },
    handleSubmitAdmin(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log("Received values of form: ", values);
          const data = {
            name: values.userName.toString(),
            password: values.password.toString()
          };
          let that = this;
          that.$axios
            .post("/api/user/loginAdmin", data)
            .then(function(res) {
              if (res.data.success) {
                localStorage.adminname = res.data.content.name;
                localStorage.adminid = res.data.content.id;
                window.location.href = "administration";
              } else {
                that.$message.info(res.data.message);
              }
            })
            .catch(function(res) {
              console.log(res);
            });
        }
      });
    }
  }
};
</script>
<style scoped>
#components-form-demo-normal-login .login-form {
  width: 400px;
}
#components-form-demo-normal-login .login-form-forgot {
  float: right;
}
#components-form-demo-normal-login .login-form-button {
  width: 100%;
}

.center-in-center {
  position: absolute;
  top: 50%;
  left: 70%;
  -webkit-transform: translate(-50%, -50%);
  -moz-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  -o-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}

.center-in-center2 {
  position: absolute;
  top: 50%;
  left: 30%;
  -webkit-transform: translate(-50%, -50%);
  -moz-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  -o-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
</style>