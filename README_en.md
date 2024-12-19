# Maven Central Repository Greasemonkey Script

[简体中文](./README.md) | English

GitHub Repository: [https://github.com/scagogogo/mvnrepository-helper-UserScript](https://github.com/scagogogo/mvnrepository-helper-UserScript)

Introduction Video: [https://www.bilibili.com/video/BV13fkgYaEDn](https://www.bilibili.com/video/BV13fkgYaEDn)

![Greasy Fork Downloads](https://img.shields.io/greasyfork/dt/471802)   ![Greasy Fork Rating](https://img.shields.io/greasyfork/rating-count/471802)   ![GitHub Created At](https://img.shields.io/github/created-at/scagogogo/mvnrepository-helper-UserScript)   ![GitHub contributors](https://img.shields.io/github/contributors-anon/scagogogo/mvnrepository-helper-UserScript)   ![GitHub top language](https://img.shields.io/github/languages/top/scagogogo/mvnrepository-helper-UserScript)   ![GitHub commit activity](https://img.shields.io/github/commit-activity/t/scagogogo/mvnrepository-helper-UserScript)   ![GitHub Release](https://img.shields.io/github/v/release/scagogogo/mvnrepository-helper-UserScript)    ![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/scagogogo/mvnrepository-helper-UserScript)   ![GitHub Issues or Pull Requests](https://img.shields.io/github/issues-closed/scagogogo/mvnrepository-helper-UserScript)   ![GitHub Issues or Pull Requests](https://img.shields.io/github/issues-pr/scagogogo/mvnrepository-helper-UserScript)   ![GitHub Issues or Pull Requests](https://img.shields.io/github/issues-pr-closed/scagogogo/mvnrepository-helper-UserScript)   ![GitHub License](https://img.shields.io/github/license/scagogogo/mvnrepository-helper-UserScript)   ![GitHub Repo stars](https://img.shields.io/github/stars/scagogogo/mvnrepository-helper-UserScript)   ![GitHub forks](https://img.shields.io/github/forks/scagogogo/mvnrepository-helper-UserScript)   ![GitHub watchers](https://img.shields.io/github/watchers/scagogogo/mvnrepository-helper-UserScript)

# I. What Problem Does It Solve?

We sometimes encounter requirements for Java projects to be compatible with JDK 1.8. This could be due to the deployment environment's demands, the need for certain JDK compatibility in Java Agent products, or requests from management or clients. Regardless of whether these requirements are reasonable or not, we have no choice but to accept and implement them.

However, during development, we may continuously add dependencies. For these JAR packages in Maven, the Maven Central Repository does not display which specific JDK version was used to compile the JAR. If we add the wrong version, our project might not run because JDK 1.8 cannot load or interpret Class files compiled with JDK 1.9. Therefore, we must be cautious when adding dependencies, and we might even have to use a binary search method to find the suitable version (an experience that can be quite frustrating for those who have gone through it). This script is designed to solve this problem by adding functionality to display the corresponding JDK version for each component version in the Maven Central Repository. This allows us to select the appropriate version based on the JDK version we need to be compatible with.

<img src="data/demo-video.gif">

# II. Installation

## 2.1 Install from Greasy Fork Store (Recommended Method)

First, you should have already installed the Tampermonkey extension:

[https://chromewebstore.google.com/detail/dhdgffkkebhmkfjojejmpbldmpobfkfo](https://chromewebstore.google.com/detail/dhdgffkkebhmkfjojejmpbldmpobfkfo)

Then, you can directly install this script from the Greasy Fork store:

[https://greasyfork.org/zh-CN/scripts/471802-repo1-maven-org-helper](https://greasyfork.org/zh-CN/scripts/471802-repo1-maven-org-helper)

## 2.2 Compile on Your Own

Clone the repository to your local machine:

```bash
git clone git@github.com:scagogogo/mvnrepository-helper-UserScript.git
```

Navigate to the cloned local directory:

```bash
cd mvnrepository-helper-UserScript
```

Install dependencies (using yarn):

```bash
yarn install
```

Or npm:

```bash
npm install
```

Then package the script (using yarn):

```bash
yarn build
```

Or npm:

```bash
npm run build
```

The packaged file will be in `dist/index.js`. You can create a new Tampermonkey script with the contents of `dist/index.js`.

![image-20241216015544138](./README.assets/image-20241216015544138.png)
# III. Detailed Feature Introduction

## 3.1 Display JDK Version for Each Version's Jar Package on Component Version List Page

On the version list page of the component, an additional column has been added to display the specific JDK compilation information for each version of the component:

![image-20241216013810124](./README.assets/image-20241216013810124.png)

The JDK compilation information is divided into two parts. One part is the compilation version analyzed from each class file in the Jar package:

![image-20241216013918398](./README.assets/image-20241216013918398.png)

For example, the information above indicates that there are 178 class files in the Jar package, 177 of which are compiled with JDK 1.6, and 1 class is compiled with JDK 1.9. In this case, if you want to use this Jar package, the safer runtime JDK version should be at least 1.9 or higher.

The other part is the compilation metadata parsed from the `META-INF/MANIFEST.MF` file in the Jar package. This is because although we can infer the minimum JDK version required to run this Jar package from the distribution of compilation versions in each class file of the Jar package, sometimes the Jar package may include some metadata in the `META-INF/MANIFEST.MF` during compilation, which may include some compilation-related metadata. Although the actual loading and interpretation of class files only look at the compilation version in the file header, there is uncertainty about whether there are any special cases determined by metadata for the minimum runtime JDK version, so this information is also provided here for reference:

![image-20241216014151485](./README.assets/image-20241216014151485.png)

## 3.2 Display Compilation JDK Version Information on Component Version Detail Page

The detail page of the component also displays which JDK version was used to compile this version of the component:

![image-20241216014633039](./README.assets/image-20241216014633039.png)

## 3.3 Quick Access to Detail Page with GAV

Without enabling the script:

![image-20230521195256248](README.assets/image-20230521195256248.png)

After enabling the script, several input boxes will be added at the bottom of the page. By entering `GroupId`, `ArtifactId`, `Version` in the input boxes and clicking the `Go` button, you can access the corresponding detail page:

![image-20230521195239339](README.assets/image-20230521195239339.png)

For example, by entering the `groupId`, `artifactId`, `version` of `fastjson` and clicking the `Go` button, the current page will be positioned to:

```plaintext
https://repo1.maven.org/maven2/com/alibaba/fastjson/2.0.9/
```

![image-20230521200329668](README.assets/image-20230521200329668.png)

Both `ArtifactId` and `Version` can be omitted, for example, omitting `Version`:

![image-20230521200922731](README.assets/image-20230521200922731.png)

For example, omitting both `ArtifactId` and `Version`:

![image-20230521200948849](README.assets/image-20230521200948849.png)

The `GroupId` can also be entered in the form of `com.alibaba:fastjson`:

![image-20230521200804487](README.assets/image-20230521200804487.png)

Additionally, all three input boxes have a history of inputs.

## 3.4 Expand Text Hidden Due to Length

Before enabling the plugin, it can be seen that the超出部分 of the text is hidden, and when their prefixes are similar, it is difficult to distinguish who is who:

![image-20230727112824602](README.assets/image-20230727112824602.png)

After enabling the plugin, the hidden text is fully displayed while ensuring that the layout does not become disordered (there may be issues on some narrow screens, but it is basically fine on slightly wider screens):

![image-20230727112809379](README.assets/image-20230727112809379.png)

On the detail page without enabling the plugin:

![image-20230727113109999](README.assets/image-20230727113109999.png)

After enabling the plugin:

![image-20230727113126701](README.assets/image-20230727113126701.png)

# 四、FAQ



![image-20241218030043456](./README.assets/image-20241218030043456.png)



# 五、Contributors

<img src="https://contrib.nn.ci/api?repo=scagogogo/mvnrepository-helper-UserScript" />

# 六、Star History

<img src="https://starchart.cc/scagogogo/mvnrepository-helper-UserScript.svg" />









































