//
//  UIJastViewController.m
//  JastChatSample
//
//  Created by adelskott on 01/04/13.
//  Copyright (c) 2013 adelskott. All rights reserved.
//

#import "UIJastViewController.h"
#import "OLGhostAlertView.h"
#import "UIJastChatIO.h"
#import "UIJastThreadChatViewController.h"

@interface UIJastViewController ()

@end

@implementation UIJastViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view, typically from a nib.
    [self.tf_login becomeFirstResponder];
    
    
    
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction)sendLogin:(id)sender {
    if (self.tf_login.text.length >= 4){
        self.v_login.hidden = YES;
        [self.tf_login resignFirstResponder];
        [self start];
        
        //__weak UIJastViewController *this = self;
        [[UIJastChatIO getInstance] sendmessage:@"peoplelistadd" message:@{@"login": self.tf_login.text}];
        [[UIJastChatIO getInstance] listen:self.tf_login.text getold:NO  cb:^(NSDictionary *rep) {
            if (![self.tf_login.text isEqualToString:rep[@"login"]]){
                [[NSNotificationCenter defaultCenter] postNotificationName:@"message" object:rep];
            }
        }];
    }else{
        self.v_login.hidden = NO;
        OLGhostAlertView *ghastly = [[OLGhostAlertView alloc]  initWithTitle:@"Error" message:@"Your login met me more than 4 character" timeout:1.5 dismissible:YES];
        [ghastly setPosition:(OLGhostAlertViewPositionTop)];
        [ghastly show];
    }
}

-(void)start{
    __weak UIJastViewController *this = self;
    [[UIJastChatIO getInstance] listen:@"peoplelist" getold:YES cb:^(NSDictionary *rep) {
        [this reloaddatalist:rep];
    }];
}

-(void)reloaddatalist:(NSDictionary*) rep{
    list = rep[@"flux"];
    [self.tb_list reloadData];
}
#pragma channel

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section{
    return [list count];
}
- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath{
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"cell"];
    if (!cell){
        cell = [[UITableViewCell alloc] initWithStyle:(UITableViewCellStyleSubtitle) reuseIdentifier:@"cell"];
    }
    cell.textLabel.text = list[indexPath.row];
    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath{
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
    UIJastThreadChatViewController *nex = [[UIJastThreadChatViewController alloc] initWithNibName:@"UIJastThreadChatViewController" bundle:nil];
    nex.me = self.tf_login.text;
    nex.login = list[indexPath.row];
    [self.navigationController pushViewController:nex animated:YES];
}

@end

