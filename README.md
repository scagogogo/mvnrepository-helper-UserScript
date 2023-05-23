# repo1.maven.org Helper 油猴脚本

此脚本是为了提升[Maven中央仓库](https://repo1.maven.org/maven2)的使用体验。

## 功能一：GAV快速访问详情页

不开启脚本的情况： 

![image-20230521195256248](README.assets/image-20230521195256248.png)

开启脚本之后会在页面底部增加几个输入框，在输入框中输入`GroupId`、`ArticleId`、`Version`之后单击`Go`按钮访问到对应的详情页：

![image-20230521195239339](README.assets/image-20230521195239339.png)

比如这样，输入`fastjson`的`groupId`、`articleId`、`version`单击`Go`按钮可将当前页面定位到：

```
https://repo1.maven.org/maven2/com/alibaba/fastjson/2.0.9/
```

![image-20230521200329668](README.assets/image-20230521200329668.png)

其中`ArticleId`和`Version`都是可以省略的，比如省略`Version`：

![image-20230521200922731](README.assets/image-20230521200922731.png)

比如同时省略`ArticleId`和`Version`：

![image-20230521200948849](README.assets/image-20230521200948849.png)

其中GroupId可以输入`com.alibaba:fastjson`的形式：

![image-20230521200804487](README.assets/image-20230521200804487.png)

另外三个输入框都有历史输入记录，目前只保留上一次的有效输入。



















































