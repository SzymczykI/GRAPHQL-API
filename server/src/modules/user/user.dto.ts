import { IsEmail, Length } from "class-validator";
import { Field, ID, InputType, ObjectType } from "type-graphql";

@ObjectType()
export class User {
  @Field(() => ID, { nullable: false })
  id: string;

  @Field(() => ID, { nullable: false })
  username: string;

  @Field(() => ID, { nullable: false })
  email: string;

  password: string;
}

@InputType()
export class RegisterUserInput {
  @Field({
    nullable: false,
  })
  username: string;

  @Field()
  //nice validator for email
  @IsEmail()
  email: string;

  @Field()
  //nice validator for password length
  @Length(6, 56)
  password: string;
}
