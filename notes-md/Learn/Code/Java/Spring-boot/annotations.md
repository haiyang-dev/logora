@Component: 一旦使用关于Spring的注解出现在类里，例如我在实现类中用到了@Autowired注解，被注解的这个类是从Spring容器中取出来的，那调用的实现类也需要被Spring容器管理，加上@Component

如果只有Autowired却没有Component,很可能run不起来！(eg Camunda的process)

@Controller 控制器（注入服务）

用于标注控制层，相当于struts中的action层

@Service 服务（注入dao）

用于标注服务层，主要用来进行业务的逻辑处理

@Repository（实现dao访问）

用于标注数据访问层，也可以说用于标注数据访问组件，即DAO组件

.

@Component （把普通pojo实例化到spring容器中，相当于配置文件中的 ）

泛指各种组件，就是说当我们的类不属于各种归类的时候（不属于@Controller、@Services等的时候），我们就可以使用@Component来标注这个类。