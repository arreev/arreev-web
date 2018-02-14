
data class User(
  val id:String,
  val firstName:String = "",
  val lastName:String = "",
  val emailAddress:String,
  val type:Int,
  val status:Int = 0,
  val extra:String = ""
)

fun asUser( id:String,emalAddress:String ) : User {
  return User( id=id,emailAddress=emalAddress,type=0 )
}
