对于needs,会改变job的顺序，同时会继承artifacts

对于dependences, 单纯的继承artifacts

对于dotenv 或者说artifacts,只要你在前一个stage里生成了dotenv, 那么在后续的所有的stage里都有这个dotenv.

如果你不想用这个dotenv, 那你必须指定needs或者depencies关键字为[].

对于trigger的， 如果你forward pipeline-variables=true, 那么child所有的job都会用foo的dotenv, 注意只有dotenv, 正常的artifacts不会forward

如果在child里你不想用foo的dotenv, 那有下面几种option:

如果你在child里面也生成了dotenv, 希望覆盖掉foo的，那需要在trigger job上加needs:[]

如果你在child里面没生成dotenv，但同时不希望看到foo的dotenv， 那1在trigger job上加needs:[]， 2 在job上needs:[]